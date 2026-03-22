const express = require("express");
const reviewRouter = express.Router();
const userRouter = express.Router();
const Review = require("../models/Review");
const User = require("../models/User");
const Order = require("../models/Order");
const { auth } = require("../middleware/auth");

// POST /api/reviews
reviewRouter.post("/", auth, async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "delivered")
      return res.status(400).json({ message: "Can only review after delivery" });

    const isBuyer = req.user.role === "buyer";
    const revieweeId = isBuyer ? order.farmerId : order.buyerId;
    const type = isBuyer ? "farmer_review" : "buyer_review";

    const existing = await Review.findOne({ orderId, reviewerId: req.user._id });
    if (existing) return res.status(400).json({ message: "Already reviewed" });

    const review = await Review.create({
      orderId, reviewerId: req.user._id, revieweeId, rating, comment, type,
    });

    // Update trust score
    const reviews = await Review.find({ revieweeId });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, {
      trustScore: Math.round(avg * 10) / 10,
      totalReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/user/:userId
reviewRouter.get("/user/:userId", async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate("reviewerId", "name avatar")
      .populate("orderId", "quantity unit")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id - public profile
userRouter.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name avatar role trustScore totalReviews farmDetails.farmName farmDetails.location.city farmDetails.cropsGrown farmDetails.description createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile - update own profile
userRouter.put("/profile/me", auth, async (req, res) => {
  try {
    const { name, phone, farmDetails, deliveryAddresses } = req.body;
    const updates = { name, phone };
    if (req.user.role === "farmer" && farmDetails) updates.farmDetails = farmDetails;
    if (req.user.role === "buyer" && deliveryAddresses) updates.deliveryAddresses = deliveryAddresses;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/dashboard/stats - dashboard stats
userRouter.get("/dashboard/stats", auth, async (req, res) => {
  try {
    const isFarmer = req.user.role === "farmer";
    if (isFarmer) {
      const [totalOrders, pendingOrders, deliveredOrders] = await Promise.all([
        Order.countDocuments({ farmerId: req.user._id }),
        Order.countDocuments({ farmerId: req.user._id, status: "pending" }),
        Order.countDocuments({ farmerId: req.user._id, status: "delivered" }),
      ]);
      const revenue = await Order.aggregate([
        { $match: { farmerId: req.user._id, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
      res.json({
        totalOrders, pendingOrders, deliveredOrders,
        totalRevenue: revenue[0]?.total || 0,
        trustScore: req.user.trustScore,
      });
    } else {
      const [totalOrders, activeOrders] = await Promise.all([
        Order.countDocuments({ buyerId: req.user._id }),
        Order.countDocuments({ buyerId: req.user._id, status: { $in: ["pending", "confirmed", "dispatched"] } }),
      ]);
      const spent = await Order.aggregate([
        { $match: { buyerId: req.user._id, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);
      res.json({
        totalOrders, activeOrders,
        totalSpent: spent[0]?.total || 0,
        trustScore: req.user.trustScore,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = reviewRouter;
