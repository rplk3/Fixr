const express = require("express");
const router = express.Router();

const { registerUser, loginUser, updateProfile } = require("../controllers/authController");
const { applyProvider } = require("../controllers/providerController");
const protect = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/apply-provider", protect, applyProvider);
router.put("/profile", protect, updateProfile);

router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

module.exports = router;