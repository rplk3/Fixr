const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Service category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: [0, "Price cannot be negative"],
    },
    location: {
      type: String,
      required: [true, "Service location is required"],
      trim: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    visibilityStatus: {
      type: String,
      enum: ["visible", "hidden", "disabled"],
      default: "disabled",
    },
    approvalActionRequired: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    pendingEdits: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);