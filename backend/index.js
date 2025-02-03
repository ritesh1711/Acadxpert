const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./Models/db");

const authRoutes = require("./Routes/AuthRouter");

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/a", (req, res) => {
  res.send("Hello, World!");
});

app.use("/auth", authRoutes);

// ❌ REMOVE `app.listen(PORT, ...)`
// ✅ EXPORT the app for Vercel
module.exports = app;
