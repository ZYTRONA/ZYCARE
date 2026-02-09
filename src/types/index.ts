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
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  DoctorProfile: { doctorId: string };
  BookAppointment: { doctorId: string };
  Consultation: { appointmentId: string };
  SymptomChecker: undefined;
  MedicalRecords: undefined;
  ChatScreen: { appointmentId: string; doctorName: string };
};

export type MainTabParamList = {
  Home: undefined;
  Doctors: undefined;
  Appointments: undefined;
  Profile: undefined;
};
