const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'ai'],
    required: true
  },
  text: { type: String, required: true },
  threadKey: { type: String, index: true }
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);



