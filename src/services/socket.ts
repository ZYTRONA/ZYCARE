import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'http://10.56.198.1:5000/api';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private userType: 'patient' | 'doctor' | null = null;

  connect(userId: string, userType: 'patient' | 'doctor') {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    this.userId = userId;
    this.userType = userType;

    // Replace http:// with the base URL
    const socketUrl = API_BASE_URL.replace('/api', '');
    
    this.socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
      
      // Join appropriate room
      if (userType === 'doctor') {
        this.socket?.emit('join_doctor_room', userId);
      } else {
        this.socket?.emit('join_patient_room', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Queue updates for doctors
    this.socket.on('queue_updated', (data) => {
      console.log('📊 Queue updated:', data);
    });

    // New appointments for doctors
    this.socket.on('new_appointment', (data) => {
      console.log('📅 New appointment:', data);
    });

    // Doctor availability changes for patients
    this.socket.on('doctor_availability_changed', (data) => {
      console.log('🔔 Doctor availability changed:', data);
    });

    // Queue position updates for patients
    this.socket.on('queue_position_updated', (data) => {
      console.log('📍 Queue position updated:', data);
    });

    // Consultation events
    this.socket.on('consultation_started', (data) => {
      console.log('📹 Consultation started:', data);
    });

    this.socket.on('consultation_ended', (data) => {
      console.log('✅ Consultation ended:', data);
    });

    // Prescription received for patients
    this.socket.on('prescription_received', (data) => {
      console.log('💊 Prescription received:', data);
    });

    // Appointment confirmed for patients
    this.socket.on('appointment_confirmed', (data) => {
      console.log('📅 Appointment confirmed:', data);
    });

    // General notifications
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification:', data);
    });
  }

  // Event listeners that components can subscribe to
  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  // Emit events
  joinQueue(patientData: any) {
    this.socket?.emit('patient_joined_queue', patientData);
  }

  updateDoctorStatus(doctorId: string, status: 'available' | 'on-break' | 'busy') {
    this.socket?.emit('doctor_status_changed', { doctorId, status });
  }

  startConsultation(doctorId: string, patientId: string) {
    this.socket?.emit('consultation_started', { doctorId, patientId });
  }

  endConsultation(doctorId: string, patientId: string) {
    this.socket?.emit('consultation_ended', { doctorId, patientId });
  }

  updateQueuePositions(patients: any[]) {
    this.socket?.emit('update_queue_position', { patients });
  }

  createPrescription(prescriptionData: any) {
    this.socket?.emit('prescription_created', prescriptionData);
  }

  createAppointment(appointmentData: any) {
    this.socket?.emit('appointment_created', appointmentData);
  }

  sendNotification(recipientType: 'doctor' | 'patient', recipientId: string, message: string, type: string = 'info') {
    this.socket?.emit('send_notification', {
      recipientType,
      recipientId,
      message,
      type,
      timestamp: new Date().toISOString()
    });
  }

  // Appointment-related listeners
  onAppointmentConfirmed(callback: (data: any) => void) {
    this.socket?.on('appointment_confirmed', callback);
  }

  offAppointmentConfirmed(callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off('appointment_confirmed', callback);
    } else {
      this.socket?.off('appointment_confirmed');
    }
  }

  onNewAppointment(callback: (data: any) => void) {
    this.socket?.on('new_appointment', callback);
  }

  offNewAppointment(callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off('new_appointment', callback);
    } else {
      this.socket?.off('new_appointment');
    }
  }

  onAppointmentCreated(callback: (data: any) => void) {
    this.socket?.on('appointment_created', callback);
  }

  offAppointmentCreated(callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off('appointment_created', callback);
    } else {
      this.socket?.off('appointment_created');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.userType = null;
      console.log('🔌 Socket manually disconnected');
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
export default socketService;
