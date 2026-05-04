const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  applyProvider,
  getAllProviders,
  updateProviderStatus,
  deleteProvider,
} = require("../controllers/providerController");

// Customer applies to become provider
router.post("/apply", protect, applyProvider);

// Admin: get all providers
router.get("/", protect, getAllProviders);

// Admin: approve or reject provider
router.put("/:id/status", protect, updateProviderStatus);

// Admin: delete provider
router.delete("/:id", protect, deleteProvider);

module.exports = router;
