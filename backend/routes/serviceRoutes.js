const express = require("express");
const router = express.Router();
const { getServices, getMyServices, createService, getServiceById, updateService, deleteService, displayService } = require("../controllers/serviceController");
const protect = require("../middleware/authMiddleware");

router.get("/", getServices);
router.post("/", protect, createService);
router.get("/my", protect, getMyServices);
router.get("/:id", protect, getServiceById);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);
router.patch("/:id/display", protect, displayService);

module.exports = router;

