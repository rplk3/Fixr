const express = require("express");
const cors = require("cors");
const serviceRoutes = require("./routes/serviceRoutes");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// connect DB
connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/services", serviceRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Fixr API Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});