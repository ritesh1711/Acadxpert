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
  catRank: {
    type: String
  },
  gateRank: {
    type: String
  },
  score: {
    type: String
  },
  
  // Course Information
  course: {
    type: String,
    required: true,
    enum: ['MCA', 'MBA', 'MTech'],
    default: 'MCA'
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    default: 1
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
  
<<<<<<< HEAD
  // Document References - Required
=======
  // Document References - Required documents
>>>>>>> abhi
  photo: {
    type: String // URL or file path
  },
  signature: {
    type: String // URL or file path
  },
  
<<<<<<< HEAD
  // Document References - Educational
=======
  // Document References - Educational documents
>>>>>>> abhi
  marksheet10th: {
    type: String // URL or file path
  },
  certificate10th: {
    type: String // URL or file path
  },
  marksheet12th: {
    type: String // URL or file path
  },
  certificate12th: {
    type: String // URL or file path
  },
  graduationMarksheet: {
    type: String // URL or file path
  },
  
<<<<<<< HEAD
  // Semester marksheets
=======
  // Document References - Semester marksheets
>>>>>>> abhi
  semester1: {
    type: String // URL or file path
  },
  semester2: {
    type: String // URL or file path
  },
  semester3: {
    type: String // URL or file path
  },
  semester4: {
    type: String // URL or file path
  },
  semester5: {
    type: String // URL or file path
  },
  semester6: {
    type: String // URL or file path
  },
  semester7: {
    type: String // URL or file path
  },
  semester8: {
    type: String // URL or file path
  },
  
<<<<<<< HEAD
  // Entrance exam documents
=======
  // Document References - Entrance exam documents
>>>>>>> abhi
  entranceAdmitCard: {
    type: String // URL or file path
  },
  entranceScoreCard: {
    type: String // URL or file path
  },
  
<<<<<<< HEAD
  // Other documents
=======
  // Document References - Other documents
>>>>>>> abhi
  provisionalCertificate: {
    type: String // URL or file path
  },
  characterCertificate: {
    type: String // URL or file path
  },
  provisionalAdmissionSlip: {
    type: String // URL or file path
  },
  paymentSlip: {
    type: String // URL or file path
  },
  studyCentreProof: {
    type: String // URL or file path
  },
  medicalCertificate: {
    type: String // URL or file path
  },
  categoryCertificate: {
    type: String // URL or file path
  },
  defenceCertificate: {
    type: String // URL or file path
  },
  aadhaarCard: {
    type: String // URL or file path
  },
  panCard: {
    type: String // URL or file path
  },
<<<<<<< HEAD
=======
  
  // Document status tracking
  documentStatus: {
    type: Object,
    default: {}
  },
  
  // Undertaking for pending documents
  undertakingText: {
    type: String
  },
>>>>>>> abhi
  
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