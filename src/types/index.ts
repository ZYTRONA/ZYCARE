import { NavigatorScreenParams } from '@react-navigation/native';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  profileImage?: string;
  phone?: string;
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth?: string;
  medicalHistory?: MedicalRecord[];
  appointments?: Appointment[];
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
  qualifications: string[];
  experience: number; // years
  rating: number;
  consultationFee: number;
  availableSlots?: TimeSlot[];
  bio?: string;
}

// Medical Types
export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  prescription?: Prescription[];
  doctorId: string;
  doctorName: string;
  notes?: string;
}

export interface Prescription {
  medication: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  description?: string;
}

export interface AISymptomAnalysis {
  symptoms: Symptom[];
  possibleConditions: PossibleCondition[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  suggestedSpecialties: string[];
  imageFindings?: string; // Visual analysis from AI if image was provided
  imageAnalyzed?: boolean; // Whether an image was included in the analysis
}

export interface PossibleCondition {
  name: string;
  probability: number; // 0-100
  description: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'video' | 'audio' | 'chat';
  symptoms?: string;
  prescription?: Prescription[];
  notes?: string;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor' | 'ai';
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'prescription';
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Login: undefined;
  Register: undefined;
  DoctorProfile: { doctorId: string };
  BookAppointment: { doctor?: Doctor };
  Consultation: { appointmentId: string };
  SymptomChecker: undefined;
  PersonalInformation: undefined;
  MedicalRecords: undefined;
  Notifications: undefined;
  PrivacySecurity: undefined;
  HelpSupport: undefined;
  About: undefined;
  Chat: undefined;
  ChatScreen: { appointmentId: string; doctorName: string };
  VideoCall: { 
    roomId?: string; 
    doctorName?: string; 
    patientId?: string;
    patientName?: string;
    patientData?: {
      age?: number;
      gender?: string;
      symptoms?: string;
    };
  };
  LanguageSelection: undefined;
  // Doctor Dashboard Routes
  DoctorDashboard: undefined;
  DoctorQueue: undefined;
  DoctorConsultation: { patientId?: string };
  DoctorPrescription: { 
    patientId?: string; 
    patientName?: string; 
    patientData?: {
      age?: number;
      gender?: string;
      symptoms?: string;
    };
  };
  DoctorSchedule: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Doctors: { filterSpecialty?: string } | undefined;
  Appointments: undefined;
  Profile: undefined;
};
