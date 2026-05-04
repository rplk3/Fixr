const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
  getProviderEarnings,
  getProviderReviews,
} = require("../controllers/bookingController");

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/provider", protect, getProviderBookings);
router.get("/provider/earnings", protect, getProviderEarnings);
router.get("/provider/reviews", protect, getProviderReviews);
router.put("/:id/status", protect, updateBookingStatus);

module.exports = router;
