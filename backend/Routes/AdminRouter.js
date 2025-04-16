const express = require('express');
const router = express.Router();
const verifyAdmin = require('../Middlewares/adminMiddleware');
const {
  getAllAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  updateAdminCredentials
} = require('../Controllers/AdminController');

// Get all admissions
router.get('/admissions', verifyAdmin, getAllAdmissions);

// Get admission by ID
router.get('/admissions/:id', verifyAdmin, getAdmissionById);

// Update admission status
router.patch('/admissions/:id/status', verifyAdmin, updateAdmissionStatus);

// Update admin credentials
router.post('/update-credentials', verifyAdmin, updateAdminCredentials);

module.exports = router; 