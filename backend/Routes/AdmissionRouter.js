const express = require('express');
const router = express.Router();
const { submitAdmission, getAdmissionById, getAdmissionByUserId, uploadMiddleware, updatePendingDocuments, precheckUnique } = require('../Controllers/AdmissionController');
const authMiddleware = require('../Middlewares/authMiddleware');

// Public pre-check route (no auth required)
router.get('/precheck-unique', precheckUnique);

// Apply authentication middleware to all routes below
router.use(authMiddleware);

// Submit admission form with documents
router.post('/submit', uploadMiddleware, submitAdmission);


// Get admission for current user
router.get('/user/admission', getAdmissionByUserId);

// Get admission by ID
router.get('/:id', getAdmissionById);

// Update pending documents
router.post('/update-pending-documents', uploadMiddleware, updatePendingDocuments);

module.exports = router; 