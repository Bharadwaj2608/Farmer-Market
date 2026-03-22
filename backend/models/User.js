const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["farmer", "buyer", "admin"], required: true },
    phone: { type: String },
    avatar: { type: String, default: "" },
    trustScore: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // Farmer-specific
    farmDetails: {
      farmName: { type: String },
      location: {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        coordinates: {
          type: { type: String, enum: ["Point"], default: "Point" },
          coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
        },
      },
      farmSizeAcres: { type: Number },
      cropsGrown: [{ type: String }],
      description: { type: String },
    },

    // Buyer-specific
    deliveryAddresses: [
      {
        label: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false },
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.index({ "farmDetails.location.coordinates": "2dsphere" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
