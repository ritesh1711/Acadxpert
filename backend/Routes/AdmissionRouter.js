const express = require('express');
const router = express.Router();
const { submitAdmission, getAdmissionById, getAdmissionByUserId, uploadMiddleware, updatePendingDocuments } = require('../Controllers/AdmissionController');
const authMiddleware = require('../Middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Submit admission form with documents
router.post('/submit', uploadMiddleware, submitAdmission);

// Get admission by ID
router.get('/:id', getAdmissionById);

// Get admission for current user
router.get('/user/admission', getAdmissionByUserId);

// Update pending documents
router.post('/update-pending-documents', uploadMiddleware, updatePendingDocuments);

module.exports = router; 