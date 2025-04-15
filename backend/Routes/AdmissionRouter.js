const express = require('express');
const router = express.Router();
const { submitAdmission, getAdmissionById, getAdmissionByUserId, uploadMiddleware } = require('../Controllers/AdmissionController');
const authMiddleware = require('../Middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Submit admission form with documents
router.post('/submit', uploadMiddleware, submitAdmission);

// Get admission details by ID
router.get('/:id', getAdmissionById);

// Get admission details for the authenticated user
router.get('/user/admission', getAdmissionByUserId);

module.exports = router; 