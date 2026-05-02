const express = require("express");
const cors = require("cors");
const serviceRoutes = require("./routes/serviceRoutes");
require("dotenv").config();

const connectDB = require("./config/db");
const bcrypt = require("bcryptjs");

const app = express();

// connect DB
connectDB().then(() => seedAdmin());

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/api/services", serviceRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);

const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Fixr API Running 🚀");
});

// Seed default admin user
async function seedAdmin() {
  try {
    const User = require("./models/User");
    const adminEmail = "admin@fixr.com";
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash("Admin@123", salt);
      await User.create({
        firstName: "Admin",
        lastName: "Fixr",
        email: adminEmail,
        password: hashed,
        roles: ["admin"],
        providerStatus: "none",
      });
      console.log("✅ Default admin seeded: admin@fixr.com / Admin@123");
    } else {
      // Ensure existing user has admin role
      if (!existing.roles.includes("admin")) {
        existing.roles.push("admin");
        await existing.save();
        console.log("✅ Admin role added to existing admin@fixr.com");
      }
    }
  } catch (err) {
    console.error("Admin seed error:", err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});