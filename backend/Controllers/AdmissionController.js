const Admission = require('../Models/Admission');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images and PDFs
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'photo' || file.fieldname === 'signature') {
    // Accept only images for photo and signature
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for photo and signature!'), false);
    }
  } else {
    // Accept only PDFs for other documents
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for documents!'), false);
    }
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit (increased from 5MB)
  }
});

// Export the upload middleware for use in routes
exports.uploadMiddleware = upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'marksheet10th', maxCount: 1 },
  { name: 'marksheet12th', maxCount: 1 },
  { name: 'graduationMarksheet', maxCount: 1 },
  { name: 'provisionalCertificate', maxCount: 1 },
  { name: 'characterCertificate', maxCount: 1 }
]);

// Submit admission form with documents
exports.submitAdmission = async (req, res) => {
  try {
    console.log('Admission submission received');
    
    // Validate user authentication
    if (!req.user || !req.user._id) {
      console.error('User not authenticated');
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    // Check if any files were uploaded
    const files = req.files || {};
    const filePaths = {};
    
    // Check for required files
    const requiredFiles = ['photo', 'signature'];
    const missingFiles = requiredFiles.filter(file => !files[file]);
    
    if (missingFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required files',
        errors: missingFiles.map(file => `${file} is required`)
      });
    }
    
    // Map file paths to their respective fields if files are provided
    Object.keys(files).forEach(fieldName => {
      filePaths[fieldName] = files[fieldName][0].path.replace(/\\/g, '/');
    });

    // Generate a unique application number if not provided
    let applicationNo = req.body.applicationNo;
    if (!applicationNo) {
      applicationNo = 'APP' + Date.now().toString().slice(-6);
    }

    // Create new admission record
    const admissionData = {
      ...req.body,
      ...filePaths,
      applicationNo,
      userId: req.user._id,
      status: 'submitted'  // Explicitly set status to submitted
    };
    
    // Validate required fields
    const admission = new Admission(admissionData);
    const validationError = admission.validateSync();
    if (validationError) {
      // Extract validation error messages in a user-friendly format
      const errorMessages = Object.values(validationError.errors).map(err => {
        const fieldName = err.path.charAt(0).toUpperCase() + err.path.slice(1);
        return `${fieldName} ${err.message}`;
      });
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }

    // Save to database
    await admission.save();

    res.status(201).json({
      success: true,
      message: 'Admission form submitted successfully',
      data: {
        applicationNo: admission.applicationNo,
        id: admission._id
      }
    });
  } catch (error) {
    console.error('Error submitting admission form:', error);
    
    // Clean up uploaded files if there's an error
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const filePath = req.files[fieldName][0].path;
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.error(`Error cleaning up file ${filePath}:`, cleanupError);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting admission form',
      error: error.message
    });
  }
};

// Get admission details by ID
exports.getAdmissionById = async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    console.error('Error fetching admission details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admission details',
      error: error.message
    });
  }
};

// Get admission details by user ID
exports.getAdmissionByUserId = async (req, res) => {
  try {
    const admission = await Admission.findOne({ userId: req.user._id });
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission record not found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    console.error('Error fetching admission details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admission details',
      error: error.message
    });
  }
}; 