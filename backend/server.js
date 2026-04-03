const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Fixr Backend Running 🚀");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});