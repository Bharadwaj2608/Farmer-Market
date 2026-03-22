const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    negotiationId: { type: mongoose.Schema.Types.ObjectId, ref: "Negotiation" },

    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    agreedPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "dispatched", "delivered", "cancelled", "refunded"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "escrowed", "released", "refunded"],
      default: "unpaid",
    },
    paymentId: { type: String },
    paymentMethod: { type: String, default: "online" },

    deliveryAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },

    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],

    expectedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    farmerNote: { type: String },
    buyerNote: { type: String },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
