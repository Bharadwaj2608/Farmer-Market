const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const { auth } = require("../middleware/auth");

// GET /api/users/:id - public profile
router.get("/:id", async (req, res) => {
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

// PUT /api/users/profile/me - update own profile
router.put("/profile/me", auth, async (req, res) => {
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

// GET /api/users/dashboard/stats
router.get("/dashboard/stats", auth, async (req, res) => {
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

module.exports = router;
