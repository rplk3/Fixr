const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { createReview, getServiceReviews } = require("../controllers/reviewController");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/service/:serviceId", getServiceReviews);

module.exports = router;
