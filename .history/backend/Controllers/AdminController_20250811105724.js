const User = require('../Models/User');
const Admission = require('../Models/Admission');
const bcrypt = require('bcrypt');
const Circular = require('../Models/Circular');

// Get all admission forms
const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().populate('userId', 'name email');
    res.status(200).json({ success: true, data: admissions });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get admission by ID
const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await Admission.findById(id).populate('userId', 'name email');
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }
    res.status(200).json({ success: true, data: admission });
  } catch (error) {
    console.error('Error fetching admission:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update admission status
const updateAdmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['submitted', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const admission = await Admission.findByIdAndUpdate(id, { status }, { new: true });
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    res.status(200).json({ success: true, data: admission });
  } catch (error) {
    console.error('Error updating admission status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update admin credentials
const updateAdminCredentials = async (req, res) => {
  try {
    const { currentPassword, newPassword, newEmail } = req.body;
    const admin = await User.findById(req.user._id);

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (newEmail) admin.email = newEmail;
    if (newPassword) admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({ success: true, message: 'Admin credentials updated successfully' });
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



const addCircular = async (req, res) => {
  try {
    const { title, course, semester } = req.body;

    console.log('Received request:', req.body, req.file);

    // Validate title
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    // Validate course
    if (!course || !['MCA', 'MBA', 'MTech'].includes(course)) {
      return res.status(400).json({
        success: false,
        message: 'Valid course is required (MCA, MBA, MTech)'
      });
    }

    // Validate semester
    if (!semester || semester < 1 || semester > 4) {
      return res.status(400).json({
        success: false,
        message: 'Valid semester is required (1 to 4)'
      });
    }

    // Validate PDF
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    const circular = new Circular({
      title,
      pdfPath: req.file.path, // For Cloudinary, store req.file.path or req.file.secure_url
      course,
      semester
    });

    await circular.save();

    res.status(201).json({
      success: true,
      message: 'Circular uploaded successfully',
      data: circular
    });
  } catch (error) {
    console.error('Error uploading circular:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};



const Circular = require('../models/Circular');

const getAllCirculars = async (req, res) => {
  try {
    // Assuming authentication middleware sets req.user
    const { course, semester } = req.user;

    if (!course || !semester) {
      return res.status(400).json({
        success: false,
        message: 'User course and semester are required to fetch circulars'
      });
    }

    const circulars = await Circular.find({ course, semester })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: circulars
    });

  } catch (error) {
    console.error('Error fetching circulars:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = { getAllCirculars };


module.exports = {
  getAllAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  updateAdminCredentials,
  addCircular,
  getAllCirculars
};
