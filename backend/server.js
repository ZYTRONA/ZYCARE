const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Pass Socket.io instance to routes that need it
if (appointmentRoutes.setSocketIO) {
  appointmentRoutes.setSocketIO(io);
}

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // Doctor joins their room
  socket.on('join_doctor_room', (doctorId) => {
    socket.join('doctors');
    socket.join(`doctor_${doctorId}`);
    console.log(`👨‍⚕️ Doctor ${doctorId} joined room`);
  });

  // Patient joins waiting room
  socket.on('join_patient_room', (patientId) => {
    socket.join('patients');
    socket.join(`patient_${patientId}`);
    console.log(`👤 Patient ${patientId} joined room`);
  });

  // Patient joins queue
  socket.on('patient_joined_queue', (data) => {
    io.to('doctors').emit('queue_updated', data);
    console.log('✅ Patient joined queue:', data.patientName);
  });

  // Doctor status change (available/on break)
  socket.on('doctor_status_changed', (data) => {
    io.to('patients').emit('doctor_availability_changed', data);
    io.to('doctors').emit('doctor_status_update', data);
    console.log(`🔔 Doctor ${data.doctorId} is now ${data.status}`);
  });

  // Consultation started
  socket.on('consultation_started', (data) => {
    io.to(`patient_${data.patientId}`).emit('consultation_started', data);
    io.to('doctors').emit('queue_updated', data);
    console.log(`📹 Consultation started: Doctor ${data.doctorId} with Patient ${data.patientId}`);
  });

  // Consultation ended
  socket.on('consultation_ended', (data) => {
    io.to(`patient_${data.patientId}`).emit('consultation_ended', data);
    io.to('doctors').emit('queue_updated', data);
    console.log(`✅ Consultation ended: ${data.patientId}`);
  });

  // Queue position updated
  socket.on('update_queue_position', (data) => {
    data.patients.forEach(patient => {
      io.to(`patient_${patient.id}`).emit('queue_position_updated', {
        position: patient.position,
        estimatedTime: patient.estimatedTime,
        tokenNumber: patient.tokenNumber
      });
    });
    io.to('doctors').emit('queue_updated', data);
    console.log('📊 Queue positions updated');
  });

  // Prescription created
  socket.on('prescription_created', (data) => {
    io.to(`patient_${data.patientId}`).emit('prescription_received', data);
    console.log(`💊 Prescription created for patient ${data.patientId}`);
  });

  // Appointment created
  socket.on('appointment_created', (data) => {
    io.to(`doctor_${data.doctorId}`).emit('new_appointment', data);
    io.to(`patient_${data.patientId}`).emit('appointment_confirmed', data);
    console.log(`📅 Appointment created: ${data.appointmentId}`);
  });

  // Real-time notification
  socket.on('send_notification', (data) => {
    if (data.recipientType === 'doctor') {
      io.to(`doctor_${data.recipientId}`).emit('notification', data);
    } else {
      io.to(`patient_${data.recipientId}`).emit('notification', data);
    }
    console.log(`🔔 Notification sent to ${data.recipientType} ${data.recipientId}`);
  });

  // Legacy support
  socket.on('new_ticket', (data) => {
    io.to('doctors').emit('new_patient', data);
    console.log('🎫 New ticket broadcasted:', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'ZYCARE Backend Running', timestamp: new Date() });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ZYCARE Backend running on port ${PORT}`);
  console.log(`📱 Mobile can connect at: http://10.56.198.1:${PORT}`);
});

module.exports = { io };
