const Admission = require('../Models/Admission');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const RollCounter = require('../Models/RollCounter');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created uploads directory at ${uploadDir}`);
      } catch (err) {
        console.error(`Error creating uploads directory: ${err.message}`);
        return cb(new Error(`Could not create uploads directory: ${err.message}`));
      }
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    try {
      // Generate a unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      console.log(`Generated filename: ${filename} for ${file.fieldname}`);
      cb(null, filename);
    } catch (err) {
      console.error(`Error generating filename: ${err.message}`);
      cb(new Error(`Error generating filename: ${err.message}`));
    }
  }
});

// File filter to accept only images and PDFs
const fileFilter = (req, file, cb) => {
  try {
    console.log(`Processing file: ${file.fieldname}, mimetype: ${file.mimetype}`);
    
    if (file.fieldname === 'photo' || file.fieldname === 'signature') {
      // Accept only images for photo and signature
      if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
      } else {
        console.error(`Invalid file type for ${file.fieldname}: ${file.mimetype}`);
        return cb(new Error(`Only image files are allowed for ${file.fieldname}!`), false);
      }
    } else {
      // For other documents, accept both PDFs and images
      if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
        return cb(null, true);
      } else {
        console.error(`Invalid file type for ${file.fieldname}: ${file.mimetype}`);
        return cb(new Error(`Only PDF or image files are allowed for ${file.fieldname}!`), false);
      }
    }
  } catch (err) {
    console.error(`Error in file filter: ${err.message}`);
    return cb(new Error(`Error processing file: ${err.message}`));
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Export the upload middleware for use in routes
exports.uploadMiddleware = upload.fields([
  // Required
  { name: 'photo', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  
  // Educational documents
  { name: 'marksheet10th', maxCount: 1 },
  { name: 'certificate10th', maxCount: 1 },
  { name: 'marksheet12th', maxCount: 1 },
  { name: 'certificate12th', maxCount: 1 },
  { name: 'graduationMarksheet', maxCount: 1 },
  
  // Semester marksheets
  { name: 'semester1', maxCount: 1 },
  { name: 'semester2', maxCount: 1 },
  { name: 'semester3', maxCount: 1 },
  { name: 'semester4', maxCount: 1 },
  { name: 'semester5', maxCount: 1 },
  { name: 'semester6', maxCount: 1 },
  { name: 'semester7', maxCount: 1 },
  { name: 'semester8', maxCount: 1 },
  
  // Entrance exam documents
  { name: 'entranceAdmitCard', maxCount: 1 },
  { name: 'entranceScoreCard', maxCount: 1 },
  
  // Other documents
  { name: 'provisionalCertificate', maxCount: 1 },
  { name: 'characterCertificate', maxCount: 1 },
  { name: 'provisionalAdmissionSlip', maxCount: 1 },
  { name: 'paymentSlip', maxCount: 1 },
  { name: 'studyCentreProof', maxCount: 1 },
  { name: 'medicalCertificate', maxCount: 1 },
  { name: 'categoryCertificate', maxCount: 1 },
  { name: 'defenceCertificate', maxCount: 1 },
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 }
]);

// Submit admission form with documents
// Submit admission form with documents
exports.submitAdmission = async (req, res) => {
  try {
    console.log('Admission submission received');

    // ✅ Validate user authentication
    if (!req.user || !req.user._id) {
      console.error('User not authenticated');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // ✅ Check uploaded files
    const files = req.files || {};
    console.log('Uploaded files:', Object.keys(files).length ? Object.keys(files).join(', ') : 'none');

    const filePaths = {};

    // ✅ Required files check
    const requiredFiles = ['photo', 'signature'];
    const missingFiles = requiredFiles.filter(file => !files[file]);

    if (missingFiles.length > 0) {
      console.error('Missing required files:', missingFiles.join(', '));
      return res.status(400).json({
        success: false,
        message: 'Missing required files',
        errors: missingFiles.map(file => `${file} is required`)
      });
    }

    // ✅ Map file paths
    Object.keys(files).forEach(fieldName => {
      const relativePath = files[fieldName][0].path.replace(/\\/g, '/');
      filePaths[fieldName] = relativePath;
      console.log(`File path for ${fieldName}: ${relativePath}`);
    });

    // ✅ Generate application number if not provided
    let applicationNo = req.body.applicationNo;
    if (!applicationNo) {
      applicationNo = 'APP' + Date.now().toString().slice(-6);
      console.log(`Generated application number: ${applicationNo}`);
    }

    // ✅ Parse documentStatus
    let documentStatus = {};
    if (req.body.documentStatus) {
      try {
        documentStatus = JSON.parse(req.body.documentStatus);
        console.log('Document status parsed successfully');
      } catch (error) {
        console.error('Error parsing document status:', error);
      }
    }

    // ✅ Unique field validation
    const { nimcetRank, catRank, gateRank, email, mobileNumber } = req.body;
    const uniqueConditions = [];
    if (applicationNo) uniqueConditions.push({ applicationNo });
    if (nimcetRank) uniqueConditions.push({ nimcetRank });
    if (catRank) uniqueConditions.push({ catRank });
    if (gateRank) uniqueConditions.push({ gateRank });
    if (email) uniqueConditions.push({ email });
    if (mobileNumber) uniqueConditions.push({ mobileNumber });

    if (uniqueConditions.length > 0) {
      const existingRecord = await Admission.findOne({ $or: uniqueConditions });
      if (existingRecord) {
        let conflictField = '';
        if (existingRecord.applicationNo === applicationNo) conflictField = 'Application Number';
        else if (existingRecord.nimcetRank === nimcetRank) conflictField = 'NIMCET Rank';
        else if (existingRecord.catRank === catRank) conflictField = 'CAT Rank';
        else if (existingRecord.gateRank === gateRank) conflictField = 'GATE Rank';
        else if (existingRecord.email === email) conflictField = 'Email';
        else if (existingRecord.mobileNumber === mobileNumber) conflictField = 'Mobile Number';

        // ✅ Clean up uploaded files
        Object.keys(files).forEach(fieldName => {
          try {
            const filePath = files[fieldName][0].path;
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Cleaned up file: ${filePath}`);
            }
          } catch (cleanupError) {
            console.error(`Error cleaning up file for ${fieldName}:`, cleanupError);
          }
        });

        return res.status(400).json({
          success: false,
          message: `${conflictField} already exists for another applicant`
        });
      }
    }

    // ✅ Prepare admission data
    const admissionData = {
      ...req.body,
      ...filePaths,
      applicationNo,
      userId: req.user._id,
      status: 'submitted',
      documentStatus: documentStatus
    };

    if (req.body.undertakingText) {
      admissionData.undertakingText = req.body.undertakingText;
    }

    console.log('Creating admission record with data:', JSON.stringify({
      applicationNo: admissionData.applicationNo,
      email: admissionData.email,
      nameEnglish: admissionData.nameEnglish,
      documentCount: Object.keys(filePaths).length
    }));

    // ✅ Validate required fields
    const admission = new Admission(admissionData);
    const validationError = admission.validateSync();
    if (validationError) {
      const errorMessages = Object.values(validationError.errors).map(err => {
        const fieldName = err.path.charAt(0).toUpperCase() + err.path.slice(1);
        return `${fieldName} ${err.message}`;
      });

      console.error('Validation errors:', errorMessages);

      // ✅ Clean up files on validation failure
      Object.keys(files).forEach(fieldName => {
        try {
          const filePath = files[fieldName][0].path;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up file: ${filePath}`);
          }
        } catch (cleanupError) {
          console.error(`Error cleaning up file for ${fieldName}:`, cleanupError);
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }

    // ✅ Generate and attach roll number atomically (per year-course-semester)
    try {
      const currentYear = new Date().getFullYear();
      const course = (admissionData.course || 'MCA').toUpperCase();
      const semester = Number(admissionData.semester || 1);
      const counter = await RollCounter.findOneAndUpdate(
        { year: currentYear, course, semester },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const seq = counter.seq || 1;
      const seqPadded = String(seq).padStart(3, '0');
      admissionData.rollNo = `CDAC${currentYear}${course}${String(semester).padStart(2, '0')}${seqPadded}`;
      if (admission) {
        admission.rollNo = admissionData.rollNo;
      }
    } catch (rollErr) {
      console.error('Error generating roll number:', rollErr);
      // continue without rollNo rather than failing submission
    }

    // ✅ Save admission record
    let savedAdmission;
    try {
      savedAdmission = await admission.save();
    } catch (dbError) {
      if (dbError && dbError.code === 11000) {
        const dupKey = Object.keys(dbError.keyValue || {})[0];
        const fieldMap = {
          applicationNo: 'Application Number',
          nimcetRank: 'NIMCET Rank',
          catRank: 'CAT Rank',
          gateRank: 'GATE Rank',
          email: 'Email',
          mobileNumber: 'Mobile Number'
        };

        // Clean up uploaded files if duplicate occurs
        if (req.files) {
          Object.keys(req.files).forEach(fieldName => {
            try {
              const filePath = req.files[fieldName][0].path;
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (_) {}
          });
        }

        return res.status(400).json({
          success: false,
          message: `${fieldMap[dupKey] || dupKey} already exists for another applicant`
        });
      }
      throw dbError;
    }
    console.log(`Admission record saved with ID: ${savedAdmission._id}`);

    res.status(201).json({
      success: true,
      message: 'Admission form submitted successfully',
      data: {
        applicationNo: savedAdmission.applicationNo,
        rollNo: savedAdmission.rollNo,
        id: savedAdmission._id
      }
    });
  } catch (error) {
    console.error('Error submitting admission form:', error);

    // ✅ Clean up uploaded files on server error
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        try {
          const filePath = req.files[fieldName][0].path;
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up file: ${filePath}`);
          }
        } catch (cleanupError) {
          console.error(`Error cleaning up file for ${fieldName}:`, cleanupError);
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

// Pre-check uniqueness for admission fields
exports.precheckUnique = async (req, res) => {
  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, conflicts: {} });
    }
    const { applicationNo, nimcetRank, catRank, gateRank, email, mobileNumber } = req.query;

    const conditions = [];
    if (applicationNo) conditions.push({ applicationNo });
    if (nimcetRank) conditions.push({ nimcetRank });
    if (catRank) conditions.push({ catRank });
    if (gateRank) conditions.push({ gateRank });
    if (email) conditions.push({ email });
    if (mobileNumber) conditions.push({ mobileNumber });

    if (conditions.length === 0) {
      return res.status(200).json({ success: true, conflicts: {} });
    }

    const existing = await Admission.findOne({ $or: conditions });
    const conflicts = {};
    if (existing) {
      if (applicationNo && existing.applicationNo === applicationNo) conflicts.applicationNo = true;
      if (nimcetRank && existing.nimcetRank === nimcetRank) conflicts.nimcetRank = true;
      if (catRank && existing.catRank === catRank) conflicts.catRank = true;
      if (gateRank && existing.gateRank === gateRank) conflicts.gateRank = true;
      if (email && existing.email === email) conflicts.email = true;
      if (mobileNumber && existing.mobileNumber === mobileNumber) conflicts.mobileNumber = true;
    }

    return res.status(200).json({ success: true, conflicts });
  } catch (error) {
    return res.status(200).json({ success: true, conflicts: {} });
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

// Lightweight existence check to avoid 404s in normal flow
exports.checkAdmissionExistsForUser = async (req, res) => {
  try {
    const admission = await Admission.findOne({ userId: req.user._id }).select('_id');
    const exists = !!admission;
    return res.status(200).json({ success: true, exists });
  } catch (error) {
    console.error('Error checking admission existence:', error);
    return res.status(500).json({ success: false, message: 'Error checking admission existence', error: error.message });
  }
};

// Update pending documents
exports.updatePendingDocuments = async (req, res) => {
  try {
    // Find the user's admission record
    const admission = await Admission.findOne({ userId: req.user._id });
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission record not found for this user'
      });
    }
    
    // Get the document status
    const documentStatus = admission.documentStatus || {};
    
    // Check if any files were uploaded
    const files = req.files || {};
    const updatedFilePaths = {};
    
    // Process each uploaded file
    Object.keys(files).forEach(fieldName => {
      // Update file path in admission record
      updatedFilePaths[fieldName] = files[fieldName][0].path.replace(/\\/g, '/');
      
      // If this was a pending document, update its status
      if (documentStatus[fieldName] && documentStatus[fieldName].pending) {
        documentStatus[fieldName].pending = false;
      }
    });
    
    // Update admission record with new files and status
    const updatedAdmission = await Admission.findByIdAndUpdate(
      admission._id, 
      { 
        $set: { 
          ...updatedFilePaths,
          documentStatus: documentStatus 
        } 
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Documents updated successfully',
      data: updatedAdmission
    });
  } catch (error) {
    console.error('Error updating pending documents:', error);
    
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
      message: 'Error updating pending documents',
      error: error.message
    });
  }
}; 


// Update admission details (Admin or Student editing their form)
exports.updateAdmission = async (req, res) => {
  try {
    const { id } = req.params; // admissionId from URL
    const updates = req.body || {};
    const files = req.files || {};

    console.log(`Updating admission record: ${id}`);

    // ✅ Find the admission record
    const admission = await Admission.findById(id);
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission record not found'
      });
    }

    // ✅ Process uploaded files (replace old paths if new files uploaded)
    const updatedFilePaths = {};
    Object.keys(files).forEach(fieldName => {
      const filePath = files[fieldName][0].path.replace(/\\/g, '/');

      // Delete old file if exists
      if (admission[fieldName] && fs.existsSync(admission[fieldName])) {
        try {
          fs.unlinkSync(admission[fieldName]);
          console.log(`Removed old file for ${fieldName}`);
        } catch (err) {
          console.error(`Error deleting old file for ${fieldName}: ${err.message}`);
        }
      }

      updatedFilePaths[fieldName] = filePath;
    });

    // ✅ Merge updates
    const updatedData = {
      ...updates,
      ...updatedFilePaths
    };

    // ✅ Update in DB
    const updatedAdmission = await Admission.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Admission details updated successfully',
      data: updatedAdmission
    });
  } catch (error) {
    console.error('Error updating admission record:', error);

    // Cleanup uploaded files if update fails
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const filePath = req.files[fieldName][0].path;
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(`Error cleaning up file ${filePath}:`, cleanupError);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating admission details',
      error: error.message
    });
  }
};
