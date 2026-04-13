const express = require("express");
const router = express.Router();
const { getServices, createService, getServiceById } = require("../controllers/serviceController");
const protect = require("../middleware/authMiddleware");

router.get("/", getServices);
router.post("/", protect, createService);
router.get("/:id", protect, getServiceById);

module.exports = router;

