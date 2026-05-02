const Review = require("../models/Review");
const Booking = require("../models/Booking");

exports.createReview = async (req, res) => {
  try {
    const { serviceId, bookingId, rating, comment } = req.body;

    if (!serviceId || !bookingId || !rating || !comment) {
      return res.status(400).json({ message: "Service, booking, rating, and comment are required" });
    }

    if (comment.trim().split(/\s+/).length > 50) {
      return res.status(400).json({ message: "Comment cannot exceed 50 words" });
    }

    const review = await Review.create({
      service: serviceId,
      customer: req.user.id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { hasReviewed: true });
    }

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const reviews = await Review.find({ service: serviceId })
      .populate("customer", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
