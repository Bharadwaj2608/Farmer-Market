const express = require("express");
const router = express.Router();
const Negotiation = require("../models/Negotiation");
const Listing = require("../models/Listing");
const { auth } = require("../middleware/auth");

// POST /api/negotiations - start negotiation
router.post("/", auth, async (req, res) => {
  try {
    const { listingId, price, quantity, message } = req.body;
    if (req.user.role !== "buyer")
      return res.status(403).json({ message: "Only buyers can initiate negotiations" });

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // Check if negotiation already exists
    let negotiation = await Negotiation.findOne({
      listingId, buyerId: req.user._id, status: "active",
    });

    if (!negotiation) {
      negotiation = await Negotiation.create({
        listingId,
        buyerId: req.user._id,
        farmerId: listing.farmerId,
        initialPrice: listing.pricePerUnit,
        messages: [],
      });
    }

    const msg = {
      senderId: req.user._id,
      senderRole: "buyer",
      type: "offer",
      price, quantity,
      message,
      timestamp: new Date(),
    };
    negotiation.messages.push(msg);
    await negotiation.save();

    const io = req.app.get("io");
    io.to(`negotiation_${negotiation._id}`).emit("new_message", {
      ...msg, senderId: { _id: req.user._id, name: req.user.name },
    });

    const populated = await negotiation.populate([
      { path: "buyerId", select: "name avatar" },
      { path: "farmerId", select: "name avatar farmDetails.farmName" },
      { path: "listingId", select: "crop pricePerUnit unit images" },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/negotiations - user's negotiations
router.get("/", auth, async (req, res) => {
  try {
    const isFarmer = req.user.role === "farmer";
    const query = isFarmer ? { farmerId: req.user._id } : { buyerId: req.user._id };

    const negotiations = await Negotiation.find(query)
      .populate("buyerId", "name avatar")
      .populate("farmerId", "name avatar farmDetails.farmName")
      .populate("listingId", "crop pricePerUnit unit images")
      .sort({ updatedAt: -1 });

    res.json(negotiations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/negotiations/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const negotiation = await Negotiation.findById(req.params.id)
      .populate("buyerId", "name avatar")
      .populate("farmerId", "name avatar farmDetails.farmName")
      .populate("listingId", "crop pricePerUnit unit images quantity")
      .populate("messages.senderId", "name avatar");

    if (!negotiation) return res.status(404).json({ message: "Negotiation not found" });

    const isParty =
      negotiation.buyerId._id.toString() === req.user._id.toString() ||
      negotiation.farmerId._id.toString() === req.user._id.toString();
    if (!isParty) return res.status(403).json({ message: "Not authorized" });

    res.json(negotiation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/negotiations/:id/message - send message in negotiation
router.post("/:id/message", auth, async (req, res) => {
  try {
    const { type, price, quantity, message } = req.body;
    const negotiation = await Negotiation.findById(req.params.id);
    if (!negotiation) return res.status(404).json({ message: "Not found" });
    if (negotiation.status !== "active")
      return res.status(400).json({ message: "Negotiation is closed" });

    const msg = {
      senderId: req.user._id,
      senderRole: req.user.role,
      type, price, quantity, message,
      timestamp: new Date(),
    };

    negotiation.messages.push(msg);

    if (type === "accept") {
      negotiation.status = "accepted";
      negotiation.agreedPrice = price;
      negotiation.agreedQuantity = quantity;
    } else if (type === "reject") {
      negotiation.status = "rejected";
    }

    await negotiation.save();

    const io = req.app.get("io");
    io.to(`negotiation_${negotiation._id}`).emit("new_message", {
      ...msg, senderId: { _id: req.user._id, name: req.user.name },
    });

    res.json(negotiation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
