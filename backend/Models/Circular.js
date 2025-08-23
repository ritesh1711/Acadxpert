const mongoose = require('mongoose');

const circularSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfPath: { type: String, required: true },
  course: {
    type: String,
    required: true,
    enum: ['MCA', 'MBA', 'MTech', 'All Courses']  // Added "All Courses" option
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Circular', circularSchema);
