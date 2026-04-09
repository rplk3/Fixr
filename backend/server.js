const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// connect DB
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Fixr API Running 🚀");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});