const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Get io instance from server
let io;
const setSocketIO = (socketIO) => {
  io = socketIO;
};

// GET /api/appointments/upcoming/:userId - Get upcoming appointments for user
router.get('/upcoming/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📡 GET /api/appointments/upcoming/:userId - User ID:', userId);
    
    const now = new Date();
    const appointments = await Appointment.find({
      patientId: userId,
      status: { $in: ['scheduled', 'in-progress'] },
      date: { $gte: now.toISOString().split('T')[0] },
    })
      .populate('doctorId')
      .sort({ date: 1, time: 1 })
      .lean();
    
    // Normalize _id to id for frontend compatibility
    const normalizedAppointments = appointments.map(apt => ({
      ...apt,
      id: apt._id.toString(),
    }));
    
    console.log(`✅ Found ${normalizedAppointments.length} upcoming appointments`);
    res.json(normalizedAppointments);
  } catch (error) {
    console.error('❌ Error fetching upcoming appointments:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /api/appointments/detail/:appointmentId - Get appointment by ID
router.get('/detail/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    console.log('📡 GET /api/appointments/detail/:appointmentId - Appointment ID:', appointmentId);
    
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId')
      .lean();
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Normalize _id to id for frontend compatibility
    const normalizedAppointment = {
      ...appointment,
      id: appointment._id.toString(),
    };
    
    console.log('✅ Appointment found:', appointmentId);
    res.json(normalizedAppointment);
  } catch (error) {
    console.error('❌ Error fetching appointment:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// GET /api/appointments/:userId - Get all appointments for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📡 GET /api/appointments/:userId - User ID:', userId);
    
    const appointments = await Appointment.find({ patientId: userId })
      .populate('doctorId')
      .sort({ createdAt: -1 })
      .lean();
    
    // Normalize _id to id for frontend compatibility
    const normalizedAppointments = appointments.map(apt => ({
      ...apt,
      id: apt._id.toString(),
    }));
    
    console.log(`✅ Found ${normalizedAppointments.length} appointments for user`);
    res.json(normalizedAppointments);
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// POST /api/appointments - Book new appointment
router.post('/', async (req, res) => {
  try {
    const { patientId, patientName, doctorId, doctorName, doctorSpecialty, date, time, type, symptoms } = req.body;
    
    console.log('📡 POST /api/appointments - Booking appointment:', { patientId, doctorId, date, time });
    
    if (!patientId || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields: patientId, date, time' });
    }

    if (!doctorId && !doctorName) {
      return res.status(400).json({ error: 'Either doctorId or doctorName must be provided' });
    }
    
    // Get doctor details if doctorId is provided and valid
    let doctor = null;
    let finalDoctorName = doctorName;
    let finalDoctorSpecialty = doctorSpecialty;
    
    if (doctorId) {
      try {
        doctor = await Doctor.findById(doctorId).lean();
        if (doctor) {
          finalDoctorName = doctorName || doctor.name;
          finalDoctorSpecialty = doctorSpecialty || doctor.specialty;
        }
      } catch (err) {
        console.log('⚠️ Doctor not found in database, using provided data');
      }
    }
    
    const appointment = new Appointment({
      patientId,
      patientName,
      doctorId: doctorId || 'unknown',
      doctorName: finalDoctorName || 'Doctor',
      doctorSpecialty: finalDoctorSpecialty || 'General Physician',
      date,
      time,
      type: type || 'video',
      symptoms: symptoms || '',
      status: 'scheduled',
    });
    
    await appointment.save();
    
    // Normalize _id to id for frontend compatibility
    const normalizedAppointment = {
      ...appointment.toObject(),
      id: appointment._id.toString(),
    };
    
    // Emit Socket.io event for real-time update
    if (io) {
      io.to(`doctor_${doctorId}`).emit('new_appointment', normalizedAppointment);
      io.to(`patient_${patientId}`).emit('appointment_confirmed', normalizedAppointment);
      io.to('doctors').emit('appointment_created', normalizedAppointment);
      console.log('🔔 Socket.io: Appointment broadcast sent');
    }
    
    console.log('✅ Appointment booked successfully:', appointment._id);
    res.status(201).json({ success: true, appointment: normalizedAppointment, message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('❌ Error booking appointment:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// PATCH /api/appointments/:appointmentId/cancel - Cancel appointment
router.patch('/:appointmentId/cancel', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    console.log('📡 PATCH /api/appointments/:appointmentId/cancel - Appointment ID:', appointmentId);
    
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    ).lean();
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Normalize _id to id for frontend compatibility
    const normalizedAppointment = {
      ...appointment,
      id: appointment._id.toString(),
    };
    
    console.log('✅ Appointment cancelled:', appointmentId);
    res.json({ success: true, appointment: normalizedAppointment, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('❌ Error cancelling appointment:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// PATCH /api/appointments/:appointmentId - Update appointment
router.patch('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updates = req.body;
    
    console.log('📡 PATCH /api/appointments/:appointmentId - Appointment ID:', appointmentId);
    
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Normalize _id to id for frontend compatibility
    const normalizedAppointment = {
      ...appointment,
      id: appointment._id.toString(),
    };
    
    console.log('✅ Appointment updated:', appointmentId);
    res.json({ success: true, appointment: normalizedAppointment, message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

module.exports = router;
module.exports.setSocketIO = setSocketIO;
