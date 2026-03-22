const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Listing = require("../models/Listing");
const { auth, isFarmer, isBuyer } = require("../middleware/auth");

// POST /api/orders - buyer places order
router.post("/", auth, isBuyer, async (req, res) => {
  try {
    const { listingId, quantity, agreedPrice, deliveryAddress, negotiationId, farmerNote, buyerNote } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.status !== "active") return res.status(400).json({ message: "Listing not available" });
    if (quantity > listing.quantity) return res.status(400).json({ message: "Insufficient quantity" });

    const finalPrice = agreedPrice || listing.pricePerUnit;
    const totalAmount = finalPrice * quantity;

    const order = await Order.create({
      listingId, quantity,
      unit: listing.unit,
      agreedPrice: finalPrice,
      totalAmount,
      buyerId: req.user._id,
      farmerId: listing.farmerId,
      deliveryAddress,
      negotiationId,
      farmerNote, buyerNote,
      statusHistory: [{ status: "pending", note: "Order placed" }],
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    });

    // Reserve quantity
    await Listing.findByIdAndUpdate(listingId, {
      $inc: { quantity: -quantity, quantitySold: quantity },
    });

    const populated = await order.populate([
      { path: "buyerId", select: "name email phone" },
      { path: "farmerId", select: "name email phone" },
      { path: "listingId", select: "crop images" },
    ]);

    // Notify via socket
    const io = req.app.get("io");
    io.emit(`order_update_${listing.farmerId}`, populated);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders - get user's orders
router.get("/", auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const isFarmerRole = req.user.role === "farmer";

    const query = isFarmerRole
      ? { farmerId: req.user._id }
      : { buyerId: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("listingId", "crop images unit")
        .populate("buyerId", "name phone")
        .populate("farmerId", "name phone farmDetails.farmName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("listingId")
      .populate("buyerId", "name email phone deliveryAddresses")
      .populate("farmerId", "name email phone farmDetails");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner =
      order.buyerId._id.toString() === req.user._id.toString() ||
      order.farmerId._id.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: "Not authorized" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status - update order status
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isFarmerRole = req.user.role === "farmer";
    const farmerActions = ["confirmed", "dispatched", "cancelled"];
    const buyerActions = ["delivered", "cancelled"];

    if (isFarmerRole && !farmerActions.includes(status))
      return res.status(403).json({ message: "Farmers can only confirm, dispatch or cancel" });
    if (!isFarmerRole && !buyerActions.includes(status))
      return res.status(403).json({ message: "Buyers can only confirm delivery or cancel" });

    order.status = status;
    order.statusHistory.push({ status, note, timestamp: new Date() });

    if (status === "delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "released";
    }
    if (status === "cancelled") {
      order.cancellationReason = note;
      // Restore quantity
      await Listing.findByIdAndUpdate(order.listingId, {
        $inc: { quantity: order.quantity, quantitySold: -order.quantity },
      });
    }

    await order.save();

    const io = req.app.get("io");
    io.emit(`order_update_${order.buyerId}`, order);
    io.emit(`order_update_${order.farmerId}`, order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/payment - simulate escrow payment
router.patch("/:id/payment", auth, isBuyer, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.buyerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    order.paymentStatus = "escrowed";
    order.paymentId = `PAY_${Date.now()}`;
    order.status = "confirmed";
    order.statusHistory.push({ status: "confirmed", note: "Payment escrowed" });
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
