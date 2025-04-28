const express = require("express");
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
const adminRoutes = require("./Routes/AdminRouter");
const verifyDocumentAccess = require("./Middlewares/uploadMiddleware");

const PORT = process.env.PORT || 8000;

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
  try {
    // Validate and sanitize the filename
    const filename = req.params.filename;
    
    // Check for path traversal attempts
    if (!filename || filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      console.error("Invalid filename requested:", filename);
      return res.status(400).send('Invalid filename');
    }
    
    const filePath = path.join(__dirname, 'uploads', filename);
    console.log("Testing access to:", filePath);
    
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File not found: ${filename}`, err.message);
        return res.status(404).send(`File not found: ${filename}`);
      }
      
      // Check file extension for appropriate content-type handling
      const ext = path.extname(filename).toLowerCase();
      if (ext === '.pdf') {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (['.jpg', '.jpeg'].includes(ext)) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (ext === '.png') {
        res.setHeader('Content-Type', 'image/png');
      }
      
      return res.sendFile(filePath);
    });
  } catch (error) {
    console.error("Error in test-file-access:", error);
    return res.status(500).send('Internal Server Error');
  }
});

app.use("/auth", authRoutes); // ✅ Ensure this route is present
app.use("/admission", admissionRoutes); // Add admission routes
app.use("/admin", adminRoutes); // Add admin routes

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the full error details
  console.error('Global error handler triggered:');
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  
  // Check for specific error types
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    let errorMessage = 'File upload error';
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        errorMessage = 'File is too large. Maximum size is 10MB';
        return res.status(413).json({
          success: false,
          message: errorMessage,
          error: err.message
        });
      case 'LIMIT_UNEXPECTED_FILE':
        errorMessage = `Unexpected field: ${err.field}`;
        break;
      default:
        errorMessage = `File upload error: ${err.message}`;
    }
    
    return res.status(400).json({
      success: false,
      message: errorMessage,
      error: err.message
    });
  }
  
  // MongoDB validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors
    });
  }
  
  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON',
      error: 'Bad request: Invalid JSON format'
    });
  }
  
  // Default 500 error
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
