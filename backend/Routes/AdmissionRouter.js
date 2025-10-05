const express = require('express');
const router = express.Router();
const { 
  getAllAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  updateAdminCredentials,
  addCircular,
  getAllCirculars,
  getAllCircularsForAdmin,
  deleteCircular,
  updateStudentAdmission   // ✅ new function
} = require('../Controllers/AdminController');

const { uploadMiddleware, submitAdmission } = require('../Controllers/AdmissionController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware'); // 👈 ensures only admins can use these routes

// Apply authentication for all routes
router.use(authMiddleware);


// Admissions management (accessible to authenticated users)
router.get('/admissions', getAllAdmissions);
router.get('/admissions/:id', getAdmissionById);

// Admin-only admissions actions
router.put('/admissions/:id/status', adminMiddleware, updateAdmissionStatus);
router.put('/admissions/:id', adminMiddleware, uploadMiddleware, updateStudentAdmission);

// Admin credentials
router.put('/update-credentials', adminMiddleware, updateAdminCredentials);

// Circulars
router.post('/circulars', adminMiddleware, uploadMiddleware, addCircular);
router.get('/circulars', getAllCirculars);
router.get('/circulars/admin', adminMiddleware, getAllCircularsForAdmin);
router.delete('/circulars/:id', adminMiddleware, deleteCircular);

// Add this route for document/admission submission
router.post('/submit', uploadMiddleware, submitAdmission);

module.exports = router;
