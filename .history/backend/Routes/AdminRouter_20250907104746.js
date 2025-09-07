const express = require('express');
const router = express.Router();
const verifyAdmin = require('../Middlewares/adminMiddleware');
const multer = require('multer');
const { getAllCirculars } = require('../Controllers/AdminController');  
const path = require('path');
const authMiddleware = require('../Middlewares/authMiddleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/circulars');   
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
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
  addCircular,
  getAllCircularsForAdmin,
  deleteCircular,
  updateStudentAdmission   // ✅ added
} = require('../Controllers/AdminController');

const { uploadMiddleware } = require('../Controllers/AdmissionController');

// Get all admissions
router.get('/admissions', verifyAdmin, getAllAdmissions);

// Get admission by ID
router.get('/admissions/:id', verifyAdmin, getAdmissionById);

// Update admission status
router.patch('/admissions/:id/status', verifyAdmin, updateAdmissionStatus);

// ✅ Update full student admission (details + docs)
router.put('/admissions/:id', verifyAdmin, uploadMiddleware, updateStudentAdmission);

// Update admin credentials
router.post('/update-credentials', verifyAdmin, updateAdminCredentials);

// Circulars
router.post('/circulars', verifyAdmin, upload.single('pdf'), addCircular);
router.get('/getcirculars', authMiddleware, getAllCirculars);
router.get('/circulars', verifyAdmin, getAllCircularsForAdmin); 
router.delete('/circulars/:id', verifyAdmin, deleteCircular);
router.delete('/delete-circular/:id', verifyAdmin, deleteCircular);

module.exports = router;
