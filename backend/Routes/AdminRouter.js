const express = require('express');
const router = express.Router();
const verifyAdmin = require('../Middlewares/adminMiddleware');
const multer = require('multer');
const { getAllCirculars } = require('../Controllers/AdminController');  
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/circulars');   
  },
  filename: (req, file, cb) => {
    
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDFs
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

const {
  getAllAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  updateAdminCredentials,
  addCircular
} = require('../Controllers/AdminController');

// Get all admissions
router.get('/admissions', verifyAdmin, getAllAdmissions);

// Get admission by ID
router.get('/admissions/:id', verifyAdmin, getAdmissionById);

// Update admission status
router.patch('/admissions/:id/status', verifyAdmin, updateAdmissionStatus);

// Update admin credentials
router.post('/update-credentials', verifyAdmin, updateAdminCredentials);

router.post('/circulars', verifyAdmin, upload.single('pdf'), addCircular);

router.get('/circulars', getAllCirculars); 


module.exports = router; 