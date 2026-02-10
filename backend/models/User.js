const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    sparse: true,
    index: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'agent'],
    default: 'patient'
  },
  name: {
    type: String,
    required: true
  },
  isNewUser: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'en'
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
