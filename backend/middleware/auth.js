const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const isFarmer = (req, res, next) => {
  if (req.user.role !== "farmer")
    return res.status(403).json({ message: "Only farmers can perform this action" });
  next();
};

const isBuyer = (req, res, next) => {
  if (req.user.role !== "buyer")
    return res.status(403).json({ message: "Only buyers can perform this action" });
  next();
};

module.exports = { auth, isFarmer, isBuyer };
