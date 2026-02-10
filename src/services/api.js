import axios from 'axios';
import Constants from 'expo-constants';

// Try multiple connection options in order
const getAPIURL = () => {
  // Priority 1: Explicit environment variable
  if (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL) {
    return Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;
  }
  
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Priority 2: Default to correct machine IP where backend is running
  return 'http://10.56.198.1:5000';
};

const API_URL = getAPIURL();

console.log('🔧 API Configuration:');
console.log('  - API_URL:', API_URL);
console.log('  - Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
console.log('  - process.env.EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('  - 📝 To fix network errors, update .env file and restart Expo');

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    console.log('📦 Request data:', config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    console.log('📦 Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('  - Status:', error.response.status);
      console.error('  - Data:', error.response.data);
    } else if (error.request) {
      console.error('  - No response received');
      console.error('  - Request:', error.request);
    }
    return Promise.reject(error);
  }
);

// Auth API - Email Based OTP
/**
 * @typedef {Object} LoginResponse
 * @property {boolean} success
 * @property {string} message
 * @property {string} userId
 * @property {string} role
 * @property {string} name
 */

/**
 * @typedef {Object} VerifyOTPResponse
 * @property {boolean} success
 * @property {boolean} verified
 * @property {Object} user
 * @property {string} user.userId
 * @property {string} user.name
 * @property {string} user.email
 * @property {string} user.role
 */

export const authAPI = {
  /**
   * Send OTP to email
   * @param {string} email - User email address
   * @param {string} name - User full name
   * @param {string} role - User role (patient or doctor)
   * @returns {Promise<LoginResponse>}
   */
  login: async (email, name, role = 'patient') => {
    console.log('🔐 authAPI.login called with:', { email, name, role });
    const response = await api.post('/api/auth/login', { email, name, role });
    return response.data;
  },

  /**
   * Verify OTP code
   * @param {string} email - User email address
   * @param {string} otp - 6-digit OTP code
   * @returns {Promise<VerifyOTPResponse>}
   */
  verifyOTP: async (email, otp) => {
    console.log('🔐 authAPI.verifyOTP called with:', { email, otp });
    const response = await api.post('/api/auth/verify-otp', { email, otp });
    return response.data;
  },

  /**
   * Resend OTP to email
   * @param {string} email - User email address
   * @returns {Promise<{success: boolean, message: string}>}
   */
  resendOTP: async (email) => {
    console.log('🔐 authAPI.resendOTP called with:', { email });
    const response = await api.post('/api/auth/resend-otp', { email });
    return response.data;
  },
};

// Ticket API
export const ticketAPI = {
  create: async (patientId, symptoms) => {
    const response = await api.post('/api/tickets/create', { patientId, symptoms });
    return response.data;
  },
  getQueue: async () => {
    const response = await api.get('/api/tickets/queue');
    return response.data;
  },
  getById: async (ticketId) => {
    const response = await api.get(`/api/tickets/${ticketId}`);
    return response.data;
  },
  updateStatus: async (ticketId, status, doctorId, doctorNotes) => {
    const response = await api.patch(`/api/tickets/${ticketId}/status`, {
      status,
      doctorId,
      doctorNotes,
    });
    return response.data;
  },
};

// User API
export const userAPI = {
  getById: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },
  update: async (userId, data) => {
    const response = await api.patch(`/api/users/${userId}`, data);
    return response.data;
  },
};

// Doctors API
export const doctorsAPI = {
  /**
   * Get all doctors
   * @returns {Promise<Array>} List of all doctors
   */
  getAll: async () => {
    console.log('🏥 doctorsAPI.getAll called');
    const response = await api.get('/api/doctors');
    return response.data;
  },

  /**
   * Get doctor by ID
   * @param {string} doctorId - Doctor ID
   * @returns {Promise<Object>} Doctor details
   */
  getById: async (doctorId) => {
    console.log('🏥 doctorsAPI.getById called with:', { doctorId });
    const response = await api.get(`/api/doctors/${doctorId}`);
    return response.data;
  },

  /**
   * Search doctors by specialty
   * @param {string} specialty - Medical specialty
   * @returns {Promise<Array>} List of doctors in that specialty
   */
  getBySpecialty: async (specialty) => {
    console.log('🏥 doctorsAPI.getBySpecialty called with:', { specialty });
    const response = await api.get(`/api/doctors/specialty/${specialty}`);
    return response.data;
  },
};

// Appointments API
export const appointmentsAPI = {
  /**
   * Get upcoming appointments for user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of upcoming appointments
   */
  getUpcoming: async (userId) => {
    console.log('📅 appointmentsAPI.getUpcoming called with:', { userId });
    const response = await api.get(`/api/appointments/upcoming/${userId}`);
    return response.data;
  },

  /**
   * Get all appointments for user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of all appointments
   */
  getAll: async (userId) => {
    console.log('📅 appointmentsAPI.getAll called with:', { userId });
    const response = await api.get(`/api/appointments/${userId}`);
    return response.data;
  },

  /**
   * Get appointment by ID
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} Appointment details
   */
  getById: async (appointmentId) => {
    console.log('📅 appointmentsAPI.getById called with:', { appointmentId });
    const response = await api.get(`/api/appointments/${appointmentId}`);
    return response.data;
  },

  /**
   * Cancel appointment
   * @param {string} appointmentId - Appointment ID
   * @returns {Promise<Object>} Cancellation response
   */
  cancel: async (appointmentId) => {
    console.log('📅 appointmentsAPI.cancel called with:', { appointmentId });
    const response = await api.patch(`/api/appointments/${appointmentId}/cancel`);
    return response.data;
  },
};

// AI Engine URL
const AI_ENGINE_URL = 'http://10.56.198.1:8000';

// AI Symptom Checker API
export const symptomCheckerAPI = {
  analyzeWithImage: async ({ symptoms, duration, additionalInfo, imageUri }) => {
    console.log('🏥 symptomCheckerAPI.analyzeWithImage called with:', { 
      symptoms, 
      duration, 
      additionalInfo, 
      hasImage: !!imageUri 
    });

    const formData = new FormData();
    formData.append('symptoms', symptoms.join(','));
    formData.append('duration', duration);
    formData.append('additional_info', additionalInfo || '');

    if (imageUri) {
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: imageUri,
        type: type,
        name: filename || 'medical.jpg'
      });
    }

    try {
      const response = await axios.post(
        `${AI_ENGINE_URL}/analyze-with-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds for image processing
        }
      );
      console.log('✅ Image analysis response:', response.data);
      
      // Normalize response to match frontend interface
      const normalizedData = {
        symptoms: response.data.symptoms || [],
        possibleConditions: response.data.possible_conditions || [],
        urgencyLevel: response.data.urgency_level || 'medium',
        recommendations: response.data.recommendations || [],
        suggestedSpecialties: response.data.suggested_specialists || [],
        imageFindings: response.data.image_findings,
        severity: response.data.severity,
        diagnosis: response.data.diagnosis,
      };
      
      return normalizedData;
    } catch (error) {
      console.error('❌ Image analysis error:', error.message);
      if (error.response) {
        console.error('  - Status:', error.response.status);
        console.error('  - Data:', error.response.data);
      }
      throw error;
    }
  },
};

// AI Nurse Chat API
export const aiNurseAPI = {
  sendMessage: async (message, conversationHistory = []) => {
    console.log('💬 aiNurseAPI.sendMessage called with:', { message, historyLength: conversationHistory.length });
    try {
      const response = await axios.post(
        `${AI_ENGINE_URL}/chat`,
        { message, conversation_history: conversationHistory },
        { timeout: 30000 }
      );
      console.log('✅ AI Nurse response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AI Nurse error:', error.message);
      throw error;
    }
  },
};

// Speech API
export const speechAPI = {
  transcribe: async (audioUri) => {
    console.log('🎤 speechAPI.transcribe called with:', audioUri);
    const formData = new FormData();
    
    const filename = audioUri.split('/').pop();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: filename || 'audio.m4a'
    });

    try {
      const response = await axios.post(
        `${AI_ENGINE_URL}/transcribe`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000,
        }
      );
      console.log('✅ Transcription response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Transcription error:', error.message);
      throw error;
    }
  },
};

export default api;
