const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const { auth, isFarmer } = require("../middleware/auth");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// ⚠️ /farmer/my MUST be before /:id
router.get("/farmer/my", auth, isFarmer, async (req, res) => {
  try {
    const listings = await Listing.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice,
      lat, lng, radius = 100,
      page = 1, limit = 12, sortBy = "createdAt",
    } = req.query;

    const query = { status: "active" };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
    }

    if (lat && lng) {
      query["location.coordinates"] = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: Number(radius) * 1000,
        },
      };
    }

    const sort = {};
    if (sortBy === "price_asc") sort.pricePerUnit = 1;
    else if (sortBy === "price_desc") sort.pricePerUnit = -1;
    else sort.createdAt = -1;

    const skip = (Number(page) - 1) * Number(limit);

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate("farmerId", "name farmDetails.farmName farmDetails.location.city trustScore avatar")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Listing.countDocuments(query),
    ]);

    res.json({ listings, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("farmerId", "name farmDetails trustScore totalReviews avatar phone");
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", auth, isFarmer, upload.array("images", 5), async (req, res) => {
  try {
    console.log("=== CREATE LISTING body:", req.body);

    const {
      crop, category, description, quantity, unit,
      pricePerUnit, isNegotiable, minOrderQuantity,
      harvestDate, expiryDate, address, city, state,
      lng, lat, tags,
    } = req.body;

    if (!crop)         return res.status(400).json({ message: "crop is required" });
    if (!category)     return res.status(400).json({ message: "category is required" });
    if (!quantity)     return res.status(400).json({ message: "quantity is required" });
    if (!unit)         return res.status(400).json({ message: "unit is required" });
    if (!pricePerUnit) return res.status(400).json({ message: "pricePerUnit is required" });

    const listing = await Listing.create({
      farmerId: req.user._id,
      crop,
      category,
      description: description || "",
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      isNegotiable: isNegotiable === true || isNegotiable === "true",
      minOrderQuantity: Number(minOrderQuantity) || 1,
      harvestDate: harvestDate && harvestDate !== "" ? new Date(harvestDate) : null,
      expiryDate: expiryDate && expiryDate !== "" ? new Date(expiryDate) : null,
      images: [],
      location: {
        address: address || "",
        city: city || "",
        state: state || "",
        coordinates: {
          type: "Point",
          coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0],
        },
      },
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error("=== CREATE LISTING ERROR:", err.message, err.errors);
    res.status(500).json({ message: err.message, details: err.errors });
  }
});

router.put("/:id", auth, isFarmer, upload.array("images", 5), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.farmerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const updates = { ...req.body };

    if (updates.isNegotiable !== undefined)
      updates.isNegotiable = updates.isNegotiable === true || updates.isNegotiable === "true";
    if (updates.harvestDate === "") updates.harvestDate = null;
    if (updates.expiryDate === "") updates.expiryDate = null;

    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Update listing error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, isFarmer, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (listing.farmerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await listing.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;