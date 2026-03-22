const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    crop: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["vegetables", "fruits", "grains", "dairy", "spices", "other"],
      required: true,
    },
    description: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 0 },
    unit: {
      type: String,
      enum: ["kg", "quintal", "ton", "dozen", "box", "litre"],
      required: true,
    },
    pricePerUnit: { type: Number, required: true, min: 0 },
    isNegotiable: { type: Boolean, default: true },
    minOrderQuantity: { type: Number, default: 1 },
    harvestDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    images: [{ type: String }],
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      coordinates: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    status: {
      type: String,
      enum: ["active", "sold", "expired", "draft"],
      default: "active",
    },
    quantitySold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

listingSchema.index({ crop: "text", description: "text", tags: "text" });
listingSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model("Listing", listingSchema);