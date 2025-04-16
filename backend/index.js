const express = require("express");
const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
require("./Models/db");

const authRoutes = require("./Routes/AuthRouter");
const admissionRoutes = require("./Routes/AdmissionRouter");
const adminRoutes = require("./Routes/AdminRouter");
const verifyDocumentAccess = require("./Middlewares/uploadMiddleware");

const PORT = process.env.PORT || 8000;

// Debug logging for environment variables
console.log('Environment variables:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

// Enable CORS
const app = express();
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('db connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the uploads directory with authentication
app.use('/uploads', (req, res, next) => {
  console.log("Uploads access request:", req.url);
  next();
}, verifyDocumentAccess, express.static(path.join(__dirname, 'uploads')));

// For debugging - create a direct route to test file access
app.get('/test-file-access/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  console.log("Testing access to:", filePath);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send(`File not found: ${req.params.filename}`);
    }
    return res.sendFile(filePath);
  });
});

app.use("/auth", authRoutes); // ✅ Ensure this route is present
app.use("/admission", admissionRoutes); // Add admission routes
app.use("/admin", adminRoutes); // Add admin routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
