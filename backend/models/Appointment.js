const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,  // Changed from ObjectId to String for flexibility
    required: true,
  },
  doctorName: {
    type: String,
    required: true,
  },
  doctorSpecialty: {
    type: String,
    required: true,
  },
  doctorImage: {
    type: String,
    default: null,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'chat'],
    default: 'video',
  },
  symptoms: {
    type: String,
    default: '',
  },
  prescription: {
    type: [
      {
        medication: String,
        dosage: String,
        duration: String,
        instructions: String,
      },
    ],
    default: [],
  },
  notes: {
    type: String,
    default: '',
  },
  roomId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
