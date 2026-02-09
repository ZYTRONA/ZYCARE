import { Doctor, Appointment, AISymptomAnalysis, User, Symptom } from '../types';

// Base API URL - would be environment variable in production
const API_BASE_URL = 'https://api.telemed-ai.com/v1';

// Mock delay to simulate network requests
const mockDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Authentication API
 */
export const authAPI = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await mockDelay(1000);
    // Mock response
    return {
      user: {
        id: 'user_123',
        email,
        name: 'John Doe',
        role: 'patient',
        phone: '+1 234 567 8900',
      },
      token: 'mock_jwt_token_xyz',
    };
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'patient' | 'doctor';
  }): Promise<{ user: User; token: string }> {
    await mockDelay(1500);
    return {
      user: {
        id: 'user_' + Date.now(),
        ...userData,
      },
      token: 'mock_jwt_token_xyz',
    };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await mockDelay(1000);
    return {
      success: true,
      message: 'Password reset email sent successfully',
    };
  },

  async logout(): Promise<void> {
    await mockDelay(500);
    // Clear stored tokens
  },
};

/**
 * Doctors API
 */
export const doctorsAPI = {
  async getDoctors(params?: {
    specialty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ doctors: Doctor[]; total: number }> {
    await mockDelay(800);
    // Mock response - would fetch from actual API
    return {
      doctors: [],
      total: 0,
    };
  },

  async getDoctorById(doctorId: string): Promise<Doctor> {
    await mockDelay(500);
    // Mock response
    return {
      id: doctorId,
      name: 'Dr. Sarah Johnson',
      email: 'sarah@telemed.com',
      role: 'doctor',
      specialty: 'General Physician',
      qualifications: ['MBBS', 'MD'],
      experience: 12,
      rating: 4.8,
      consultationFee: 50,
      bio: 'Experienced general physician with expertise in preventive care.',
    };
  },

  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    await mockDelay(600);
    return ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];
  },
};

/**
 * Appointments API
 */
export const appointmentsAPI = {
  async getAppointments(status?: 'scheduled' | 'completed' | 'cancelled'): Promise<Appointment[]> {
    await mockDelay(700);
    return [];
  },

  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    await mockDelay(500);
    return {
      id: appointmentId,
      patientId: 'patient_1',
      doctorId: 'doctor_1',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialty: 'General Physician',
      date: '2026-02-10',
      time: '10:00 AM',
      status: 'scheduled',
      type: 'video',
    };
  },

  async createAppointment(data: {
    doctorId: string;
    date: string;
    time: string;
    type: 'video' | 'audio' | 'chat';
    symptoms?: string;
  }): Promise<Appointment> {
    await mockDelay(1200);
    return {
      id: 'apt_' + Date.now(),
      patientId: 'patient_1',
      doctorId: data.doctorId,
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialty: 'General Physician',
      date: data.date,
      time: data.time,
      status: 'scheduled',
      type: data.type,
      symptoms: data.symptoms,
    };
  },

  async cancelAppointment(appointmentId: string): Promise<{ success: boolean }> {
    await mockDelay(800);
    return { success: true };
  },

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<Appointment> {
    await mockDelay(1000);
    return {
      id: appointmentId,
      patientId: 'patient_1',
      doctorId: 'doctor_1',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialty: 'General Physician',
      date: newDate,
      time: newTime,
      status: 'scheduled',
      type: 'video',
    };
  },
};

/**
 * AI Symptom Checker API
 */
export const symptomCheckerAPI = {
  async analyzeSymptoms(data: {
    symptoms: string[];
    duration: string;
    additionalInfo?: string;
    patientAge?: number;
    patientGender?: string;
  }): Promise<AISymptomAnalysis> {
    await mockDelay(3000);
    
    // In production, this would call an AI/ML service
    return {
      symptoms: data.symptoms.map((symptom) => ({
        id: symptom,
        name: symptom,
        severity: 'moderate',
        duration: data.duration,
      })),
      possibleConditions: [
        {
          name: 'Common Cold',
          probability: 75,
          description: 'A viral infection affecting the upper respiratory tract.',
        },
        {
          name: 'Seasonal Flu',
          probability: 45,
          description: 'An infection caused by influenza viruses.',
        },
        {
          name: 'Allergic Reaction',
          probability: 30,
          description: 'An immune response to environmental allergens.',
        },
      ],
      urgencyLevel: 'medium',
      recommendations: [
        'Rest and stay hydrated',
        'Monitor symptoms for 24-48 hours',
        'Take over-the-counter medication for relief',
        'Consult a doctor if symptoms worsen',
      ],
      suggestedSpecialties: ['General Physician', 'ENT Specialist'],
    };
  },
};

/**
 * Video Call API
 */
export const videoCallAPI = {
  async initializeCall(appointmentId: string): Promise<{
    roomId: string;
    token: string;
  }> {
    await mockDelay(1000);
    return {
      roomId: 'room_' + appointmentId,
      token: 'video_token_xyz',
    };
  },

  async endCall(roomId: string): Promise<{ success: boolean; duration: number }> {
    await mockDelay(500);
    return {
      success: true,
      duration: 1800, // 30 minutes in seconds
    };
  },
};

/**
 * Chat API
 */
export const chatAPI = {
  async getMessages(appointmentId: string): Promise<{
    messages: Array<{
      id: string;
      senderId: string;
      message: string;
      timestamp: string;
    }>;
  }> {
    await mockDelay(600);
    return { messages: [] };
  },

  async sendMessage(
    appointmentId: string,
    message: string
  ): Promise<{ messageId: string; timestamp: string }> {
    await mockDelay(300);
    return {
      messageId: 'msg_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * User Profile API
 */
export const userAPI = {
  async getProfile(): Promise<User> {
    await mockDelay(500);
    return {
      id: 'user_123',
      email: 'john@email.com',
      name: 'John Doe',
      role: 'patient',
      phone: '+1 234 567 8900',
    };
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    await mockDelay(800);
    return {
      id: 'user_123',
      email: data.email || 'john@email.com',
      name: data.name || 'John Doe',
      role: 'patient',
      phone: data.phone || '+1 234 567 8900',
    };
  },

  async getMedicalRecords(): Promise<Array<{
    id: string;
    date: string;
    diagnosis: string;
    doctorName: string;
  }>> {
    await mockDelay(700);
    return [];
  },
};

export default {
  auth: authAPI,
  doctors: doctorsAPI,
  appointments: appointmentsAPI,
  symptomChecker: symptomCheckerAPI,
  videoCall: videoCallAPI,
  chat: chatAPI,
  user: userAPI,
};
