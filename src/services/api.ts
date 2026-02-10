import { Doctor, Appointment, AISymptomAnalysis, User, Symptom } from '../types';

// Real Backend API URL
const API_BASE_URL = 'http://10.56.198.1:5000/api';
const API_TIMEOUT = 15000; // 15 seconds timeout

// Check if API is reachable
let apiIsReachable = true;

export const checkAPIConnectivity = async (): Promise<boolean> => {
  try {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const response = await Promise.race([
      fetch(baseUrl, { method: 'HEAD' }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ]);
    apiIsReachable = true;
    console.log('✅ API is reachable');
    return true;
  } catch (error) {
    apiIsReachable = false;
    console.error('❌ API is NOT reachable:', error);
    return false;
  }
};

// Fetch helper function with timeout
const fetchWithTimeout = (url: string, options?: any, timeout: number = API_TIMEOUT): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('API request timeout')), timeout)
    ),
  ]) as Promise<Response>;
};

// Fetch helper function for real API calls with better error handling
const fetchAPI = async (endpoint: string, options?: any) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🌐 API Request:', url, options?.body ? JSON.parse(options.body) : '');
  
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    console.log('📊 API Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API Error ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response Data:', url, data);
    return data;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error('❌ API Fetch Error:', {
      endpoint,
      error: errorMessage,
      url,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

/**
 * Authentication API - Email Based OTP
 */
export const authAPI = {
  async login(email: string, name: string, role: 'patient' | 'doctor' = 'patient'): Promise<{ success: boolean; message: string; userId: string; role: string; name: string }> {
    try {
      return await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, name, role }),
      });
    } catch (error) {
      console.error('❌ Error logging in:', error);
      throw error;
    }
  },

  async verifyOTP(email: string, otp: string): Promise<{ success: boolean; verified?: boolean; message?: string; user?: User }> {
    try {
      return await fetchAPI('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      throw error;
    }
  },

  async resendOTP(email: string): Promise<{ success: boolean; message: string }> {
    try {
      return await fetchAPI('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('❌ Error resending OTP:', error);
      throw error;
    }
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'patient' | 'doctor';
  }): Promise<{ user: User; token: string }> {
    try {
      return await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error('❌ Error registering user:', error);
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      return await fetchAPI('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      return await fetchAPI('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('❌ Error logging out:', error);
      throw error;
    }
  },
};

/**
 * Doctors API - Real Backend Integration Only
 */
export const doctorsAPI = {
  async getAll(): Promise<Doctor[]> {
    try {
      return await fetchAPI('/doctors');
    } catch (error) {
      console.error('❌ Error fetching doctors from API, returning fallback data:', error);
      // Return empty array instead of crashing
      return [];
    }
  },

  async getById(doctorId: string): Promise<Doctor> {
    try {
      return await fetchAPI(`/doctors/${doctorId}`);
    } catch (error) {
      console.error('❌ Error fetching doctor by ID:', error);
      throw error;
    }
  },

  async getBySpecialty(specialty: string): Promise<Doctor[]> {
    try {
      return await fetchAPI(`/doctors/specialty/${specialty}`);
    } catch (error) {
      console.error('❌ Error fetching doctors by specialty:', error);
      return [];
    }
  },

  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    try {
      return await fetchAPI(`/doctors/${doctorId}/slots?date=${date}`);
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      return [];
    }
  },
};

/**
 * Appointments API - Real Backend Integration Only
 */
export const appointmentsAPI = {
  async getUpcoming(userId: string): Promise<Appointment[]> {
    try {
      return await fetchAPI(`/appointments/upcoming/${userId}`);
    } catch (error) {
      console.error('❌ Error fetching upcoming appointments:', error);
      return [];
    }
  },

  async getAll(userId: string): Promise<Appointment[]> {
    try {
      return await fetchAPI(`/appointments/${userId}`);
    } catch (error) {
      console.error('❌ Error fetching all appointments:', error);
      return [];
    }
  },

  async getById(appointmentId: string): Promise<Appointment> {
    try {
      return await fetchAPI(`/appointments/${appointmentId}`);
    } catch (error) {
      console.error('❌ Error fetching appointment by ID:', error);
      throw error;
    }
  },

  async cancel(appointmentId: string): Promise<{ success: boolean }> {
    try {
      return await fetchAPI(`/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('❌ Error canceling appointment:', error);
      throw error;
    }
  },

  async createAppointment(data: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    date: string;
    time: string;
    type: 'video' | 'audio' | 'chat';
    symptoms?: string;
  }): Promise<Appointment> {
    try {
      return await fetchAPI('/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      throw error;
    }
  },

  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Promise<Appointment> {
    try {
      return await fetchAPI(`/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({ newDate, newTime }),
      });
    } catch (error) {
      console.error('❌ Error rescheduling appointment:', error);
      throw error;
    }
  },
};

/**
 * AI Symptom Checker API - Real Backend Integration
 */
export const symptomCheckerAPI = {
  async analyzeSymptoms(data: {
    symptoms: string[];
    duration: string;
    additionalInfo?: string;
    patientAge?: number;
    patientGender?: string;
  }): Promise<AISymptomAnalysis> {
    try {
      return await fetchAPI('/symptom-checker/analyze', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('❌ Error analyzing symptoms:', error);
      throw error;
    }
  },

  async analyzeWithImage(data: {
    symptoms: string[];
    duration: string;
    additionalInfo?: string;
    imageUri?: string | null;
  }): Promise<AISymptomAnalysis> {
    try {
      return await fetchAPI('/symptom-checker/analyze-with-image', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('❌ Error analyzing symptoms with image:', error);
      throw error;
    }
  },
};

/**
 * Video Call API - Real Backend Integration
 */
export const videoCallAPI = {
  async initializeCall(appointmentId: string): Promise<{
    roomId: string;
    token: string;
  }> {
    try {
      return await fetchAPI('/video-calls/initialize', {
        method: 'POST',
        body: JSON.stringify({ appointmentId }),
      });
    } catch (error) {
      console.error('❌ Error initializing video call:', error);
      throw error;
    }
  },

  async endCall(roomId: string): Promise<{ success: boolean; duration: number }> {
    try {
      return await fetchAPI(`/video-calls/${roomId}/end`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('❌ Error ending video call:', error);
      throw error;
    }
  },
};

/**
 * Chat API - Real Backend Integration
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
    try {
      return await fetchAPI(`/chat/appointments/${appointmentId}/messages`);
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return { messages: [] };
    }
  },

  async sendMessage(
    appointmentId: string,
    message: string
  ): Promise<{ messageId: string; timestamp: string }> {
    try {
      return await fetchAPI(`/chat/appointments/${appointmentId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  },
};

/**
 * User Profile API - Real Backend Integration
 */
export const userAPI = {
  async getProfile(): Promise<User> {
    try {
      return await fetchAPI('/users/profile');
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      return await fetchAPI('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  },

  async getMedicalRecords(): Promise<Array<{
    id: string;
    date: string;
    diagnosis: string;
    doctorName: string;
  }>> {
    try {
      return await fetchAPI('/users/medical-records');
    } catch (error) {
      console.error('❌ Error fetching medical records:', error);
      return [];
    }
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
