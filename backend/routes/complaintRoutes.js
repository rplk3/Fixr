const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  deleteComplaint
} = require("../controllers/complaintController");

// Customer routes
router.post("/", protect, createComplaint);
router.get("/my", protect, getMyComplaints);

// Admin routes
router.get("/", protect, adminOnly, getAllComplaints);
router.get("/:id", protect, adminOnly, getComplaintById);
router.put("/:id/status", protect, adminOnly, updateComplaintStatus);
router.delete("/:id", protect, adminOnly, deleteComplaint);

module.exports = router;
