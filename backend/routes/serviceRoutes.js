const express = require("express");
const router = express.Router();
const { getServices, createService, getServiceById, updateService, deleteService } = require("../controllers/serviceController");
const protect = require("../middleware/authMiddleware");

router.get("/", getServices);
router.post("/", protect, createService);
router.get("/:id", protect, getServiceById);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

module.exports = router;

