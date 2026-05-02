const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.trim().split(/\s+/).length <= 50;
        },
        message: "Comment cannot exceed 50 words",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
