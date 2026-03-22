const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["farmer", "buyer"] },
  type: { type: String, enum: ["offer", "counter", "accept", "reject", "message"], required: true },
  price: { type: Number },
  quantity: { type: Number },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const negotiationSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["active", "accepted", "rejected", "ordered"],
      default: "active",
    },

    initialPrice: { type: Number },
    agreedPrice: { type: Number },
    agreedQuantity: { type: Number },

    messages: [messageSchema],

    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Negotiation", negotiationSchema);
