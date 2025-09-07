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

const { uploadMiddleware } = require('../Controllers/AdmissionController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware'); // 👈 ensures only admins can use these routes

// Apply authentication + admin check
router.use(authMiddleware, adminMiddleware);

// Admissions management
router.get('/admissions', getAllAdmissions);
router.get('/admissions/:id', getAdmissionById);
router.put('/admissions/:id/status', updateAdmissionStatus);

// ✅ Admin can update student admission details + documents
router.put('/admissions/:id', uploadMiddleware, updateStudentAdmission);

// Admin credentials
router.put('/update-credentials', updateAdminCredentials);

// Circulars
router.post('/circulars', uploadMiddleware, addCircular);
router.get('/circulars', getAllCirculars);
router.get('/circulars/admin', getAllCircularsForAdmin);
router.delete('/circulars/:id', deleteCircular);

module.exports = router;
