const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

// Public
router.get("/", getCategories);

// Admin only
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
