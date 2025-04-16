const User = require('../Models/User');
const Admission = require('../Models/Admission');
const bcrypt = require('bcrypt');

// Get all admission forms
const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().populate('userId', 'name email');
    
    res.status(200).json({
      success: true,
      data: admissions
    });
  } catch (error) {
    console.error('Error fetching admissions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get admission by ID
const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await Admission.findById(id).populate('userId', 'name email');
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    console.error('Error fetching admission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update admission status
const updateAdmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['submitted', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const admission = await Admission.findByIdAndUpdate(
      id, 
      { status },
      { new: true }
    );
    
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: 'Admission not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: admission
    });
  } catch (error) {
    console.error('Error updating admission status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update admin credentials
const updateAdminCredentials = async (req, res) => {
  try {
    const { currentPassword, newPassword, newEmail } = req.body;
    
    // Get admin user
    const admin = await User.findById(req.user._id);
    
    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update admin information
    if (newEmail) {
      admin.email = newEmail;
    }
    
    if (newPassword) {
      admin.password = await bcrypt.hash(newPassword, 10);
    }
    
    await admin.save();
    
    res.status(200).json({
      success: true,
      message: 'Admin credentials updated successfully'
    });
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  updateAdminCredentials
}; 