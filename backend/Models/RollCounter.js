const mongoose = require('mongoose');

const rollCounterSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  course: { type: String, required: true, enum: ['MCA', 'MBA', 'MTech'] },
  semester: { type: Number, required: true, min: 1, max: 4 },
  seq: { type: Number, required: true, default: 0 }
}, { timestamps: true });

rollCounterSchema.index({ year: 1, course: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('RollCounter', rollCounterSchema);


