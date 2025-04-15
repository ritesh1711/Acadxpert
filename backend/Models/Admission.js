const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  // Application Information
  applicationNo: {
    type: String,
    required: true,
    unique: true
  },
  nimcetRank: {
    type: String
  },
  score: {
    type: String
  },
  
  // Candidate Information
  nameEnglish: {
    type: String,
    required: true
  },
  nameHindi: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  
  // Mother's Information
  motherNameEnglish: {
    type: String
  },
  motherNameHindi: {
    type: String
  },
  motherOccupation: {
    type: String
  },
  motherOfficeAddress: {
    type: String
  },
  motherEmail: {
    type: String
  },
  motherPhone: {
    type: String
  },
  
  // Father's Information
  fatherNameEnglish: {
    type: String
  },
  fatherNameHindi: {
    type: String
  },
  fatherOccupation: {
    type: String
  },
  fatherOfficeAddress: {
    type: String
  },
  fatherEmail: {
    type: String
  },
  fatherPhone: {
    type: String
  },
  
  // Address Information
  permanentAddress: {
    type: String
  },
  state: {
    type: String
  },
  district: {
    type: String
  },
  pinCode: {
    type: String
  },
  correspondenceAddress: {
    type: String
  },
  correspondenceEmail: {
    type: String
  },
  
  // Personal Information
  dateOfBirth: {
    day: { type: String },
    month: { type: String },
    year: { type: String }
  },
  category: {
    type: String
  },
  
  // Document References
  photo: {
    type: String // URL or file path
  },
  signature: {
    type: String // URL or file path
  },
  marksheet10th: {
    type: String // URL or file path
  },
  marksheet12th: {
    type: String // URL or file path
  },
  graduationMarksheet: {
    type: String // URL or file path
  },
  provisionalCertificate: {
    type: String // URL or file path
  },
  characterCertificate: {
    type: String // URL or file path
  },
  
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application Status
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected'],
    default: 'submitted'
  },
  
  remarks: {
    type: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
admissionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Admission', admissionSchema); 