const express = require("express");
const app = express(); // ✅ MOVE THIS TO THE TOP

const mongoose = require('mongoose');
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
require("./Models/db");
const multer = require('multer');

const authRoutes = require("./Routes/AuthRouter");
const admissionRoutes = require("./Routes/AdmissionRouter");
const adminRoutes = require("./Routes/AdminRouter"); // ✅ Moved down (still fine)

const verifyDocumentAccess = require("./Middlewares/uploadMiddleware");

const PORT = process.env.PORT || 8000;

// ✅ Remove the old misplaced app.use(adminRoutes) here

// Debug logging for environment variables
console.log('Environment variables:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created uploads directory at ${uploadsDir}`);
  } catch (err) {
    console.error(`ERROR: Failed to create uploads directory: ${err.message}`);
  }
}

// Enable CORS
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

// Static file serving with middleware
app.use('/uploads', (req, res, next) => {
  console.log("Uploads access request:", req.url);
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/test-file-access/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      return res.status(400).send('Invalid filename');
    }

    const filePath = path.join(__dirname, 'uploads', filename);
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) return res.status(404).send(`File not found: ${filename}`);
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.pdf') res.setHeader('Content-Type', 'application/pdf');
      else if (['.jpg', '.jpeg'].includes(ext)) res.setHeader('Content-Type', 'image/jpeg');
      else if (ext === '.png') res.setHeader('Content-Type', 'image/png');

      return res.sendFile(filePath);
    });
  } catch (error) {
    return res.status(500).send('Internal Server Error');
  }
});

// ✅ Register your routes AFTER app is defined
app.use("/auth", authRoutes);
app.use("/admission", admissionRoutes);
app.use("/admin", adminRoutes); //


// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler triggered:', err.message);

  if (err instanceof multer.MulterError) {
    let errorMessage = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, message: 'File too large', error: err.message });
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      errorMessage = `Unexpected field: ${err.field}`;
    } else {
      errorMessage = `File upload error: ${err.message}`;
    }
    return res.status(400).json({ success: false, message: errorMessage });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON format' });
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
