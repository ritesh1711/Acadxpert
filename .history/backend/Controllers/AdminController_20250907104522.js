const User = require('../Models/User');
const Admission = require('../Models/Admission');
const bcrypt = require('bcrypt');
const Circular = require('../Models/Circular');
const fs = require('fs');
const path = require('path');

// Get all admission forms
const getAllAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().populate('userId', 'name username'); // updated
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
    const admission = await Admission.findById(id).populate('userId', 'name username'); // updated
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
    const { currentPassword, newPassword, newUsername } = req.body; // updated
    const admin = await User.findById(req.user._id);

    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (newUsername) admin.username = newUsername; // updated
    if (newPassword) admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({ success: true, message: 'Admin credentials updated successfully' });
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Add circular
const addCircular = async (req, res) => {
  try {
    const { title, course, semester } = req.body;

    console.log('Received request:', req.body, req.file);

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    if (!course || !['MCA', 'MBA', 'MTech', 'All Courses'].includes(course)) {
      return res.status(400).json({ success: false, message: 'Valid course is required (MCA, MBA, MTech, All Courses)' });
    }

    if (!semester || semester < 1 || semester > 4) {
      return res.status(400).json({ success: false, message: 'Valid semester is required (1 to 4)' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'PDF file is required' });
    }

    const circular = new Circular({
      title,
      pdfPath: req.file.path.replace(/\\/g, '/'),
      course,
      semester
    });

    await circular.save();

    res.status(201).json({ success: true, message: 'Circular uploaded successfully', data: circular });
  } catch (error) {
    console.error('Error uploading circular:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all circulars
const getAllCirculars = async (req, res) => {
  try {
    let query = {};

    if (!req.user.isAdmin) {
      const { course, semester } = req.user;
      query.$or = [
        { course: course, semester: semester },
        { course: 'All Courses', semester: semester }
      ];
    } else {
      if (req.query.course) query.course = req.query.course;
      if (req.query.semester) query.semester = req.query.semester;
    }

    const circulars = await Circular.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: circulars });
  } catch (error) {
    console.error('Error fetching circulars:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all circulars for admin dashboard
const getAllCircularsForAdmin = async (req, res) => {
  try {
    let query = {};

    if (req.query.course) query.course = req.query.course;
    if (req.query.semester) query.semester = req.query.semester;

    const circulars = await Circular.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: circulars });
  } catch (error) {
    console.error('Error fetching circulars for admin:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete a circular (admin only)
const deleteCircular = async (req, res) => {
  try {
    const { id } = req.params;
    const circular = await Circular.findById(id);
    if (!circular) {
      return res.status(404).json({ success: false, message: 'Circular not found' });
    }

    if (circular.pdfPath) {
      const absolutePath = path.isAbsolute(circular.pdfPath)
        ? circular.pdfPath
        : path.join(__dirname, '..', circular.pdfPath);
      fs.unlink(absolutePath, (err) => {
        if (err) {
          console.warn('Failed to delete circular file:', err.message);
        }
      });
    }

    await Circular.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Circular deleted successfully' });
  } catch (error) {
    console.error('Error deleting circular:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update student admission details (Admin only)
const updateStudentAdmission = async (req, res) => {
  try {
    const { id } = req.params; // Admission ID
    const updates = req.body || {};
    const files = req.files || {};

    console.log(`Admin updating admission record: ${id}`);

    // ✅ Find admission record
    const admission = await Admission.findById(id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission not found' });
    }

    // ✅ Handle uploaded files (replace old ones if new provided)
    const updatedFilePaths = {};
    Object.keys(files).forEach(fieldName => {
      const newPath = files[fieldName][0].path.replace(/\\/g, '/');

      // Remove old file if it exists
      if (admission[fieldName] && fs.existsSync(admission[fieldName])) {
        try {
          fs.unlinkSync(admission[fieldName]);
          console.log(`Removed old file for ${fieldName}`);
        } catch (err) {
          console.error(`Error deleting old file for ${fieldName}: ${err.message}`);
        }
      }

      updatedFilePaths[fieldName] = newPath;
    });

    // ✅ Merge updates
    const updatedData = {
      ...updates,
      ...updatedFilePaths
    };

    // ✅ Update record in DB
    const updatedAdmission = await Admission.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).populate('userId', 'name username');

    res.status(200).json({
      success: true,
      message: 'Student admission record updated successfully',
      data: updatedAdmission
    });
  } catch (error) {
    console.error('Error updating student admission record:', error);

    // Cleanup new uploads if update fails
    if (req.files) {
      Object.keys(req.files).forEach(fieldName => {
        const filePath = req.files[fieldName][0].path;
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (cleanupError) {
          console.error(`Error cleaning up file ${filePath}:`, cleanupError);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating student admission record',
      error: error.message
    });
  }
};


module.exports = {
  getAllAdmissions,
  getAdmissionById,
  updateAdmissionStatus,
  updateAdminCredentials,
  addCircular,
  getAllCirculars,
  getAllCircularsForAdmin,
  deleteCircular,
  updateStudentAdmission
};
