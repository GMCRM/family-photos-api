const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  url: {
    type: String,
    required: true
  },
  caption: {
    type: String
  },
  tags: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  visibility: {
    type: String,
    enum: ['private', 'family'],
    default: 'family'
  }
});

module.exports = mongoose.model('Photo', photoSchema);
