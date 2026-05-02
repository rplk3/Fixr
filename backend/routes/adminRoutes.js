const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  getDashboardStats,
  getAllServices,
  deleteService,
  updateService,
  getAllBookings,
  getAllProviders,
  updateProviderStatus,
  deleteProvider,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  getAllReviews,
  deleteReview,
  getAllUsers,
} = require("../controllers/adminController");

// All admin routes require protect + adminOnly
router.use(protect, adminOnly);

// Dashboard stats
router.get("/dashboard", getDashboardStats);

// Services (Category Management)
router.get("/services", getAllServices);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

// Bookings (Appointments)
router.get("/bookings", getAllBookings);

// Providers (Worker Profiles)
router.get("/providers", getAllProviders);
router.put("/providers/:id/status", updateProviderStatus);
router.delete("/providers/:id", deleteProvider);

// Payments (Financial Records)
router.get("/payments", getAllPayments);
router.get("/payments/:id", getPaymentById);
router.put("/payments/:id/status", updatePaymentStatus);
router.delete("/payments/:id", deletePayment);

// Reviews / Feedback
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

// Users
router.get("/users", getAllUsers);

module.exports = router;
