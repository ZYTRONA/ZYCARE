// App Theme Colors
export const Colors = {
  primary: '#4A90D9',
  primaryDark: '#2E6DB3',
  primaryLight: '#7BB3E8',
  secondary: '#27AE60',
  secondaryLight: '#58D68D',
  accent: '#F39C12',
  
  // Background
  background: '#F8FAFC',
  cardBackground: '#FFFFFF',
  
  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textWhite: '#FFFFFF',
  
  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Severity
  severityLow: '#22C55E',
  severityMedium: '#F59E0B',
  severityHigh: '#EF4444',
  
  // Others
  border: '#E2E8F0',
  disabled: '#CBD5E1',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// App Typography
export const Typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// App Spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// App Shadows
export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Medical Specialties
export const MEDICAL_SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Neurologist',
  'Psychiatrist',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist',
  'Dentist',
  'Pulmonologist',
];

// Common Symptoms List
export const COMMON_SYMPTOMS = [
  { id: '1', name: 'Headache', category: 'general' },
  { id: '2', name: 'Fever', category: 'general' },
  { id: '3', name: 'Cough', category: 'respiratory' },
  { id: '4', name: 'Fatigue', category: 'general' },
  { id: '5', name: 'Body Pain', category: 'musculoskeletal' },
  { id: '6', name: 'Sore Throat', category: 'respiratory' },
  { id: '7', name: 'Runny Nose', category: 'respiratory' },
  { id: '8', name: 'Nausea', category: 'digestive' },
  { id: '9', name: 'Dizziness', category: 'neurological' },
  { id: '10', name: 'Chest Pain', category: 'cardiovascular' },
  { id: '11', name: 'Shortness of Breath', category: 'respiratory' },
  { id: '12', name: 'Stomach Pain', category: 'digestive' },
  { id: '13', name: 'Back Pain', category: 'musculoskeletal' },
  { id: '14', name: 'Skin Rash', category: 'dermatological' },
  { id: '15', name: 'Anxiety', category: 'mental' },
];

// Consultation Types
export const CONSULTATION_TYPES = [
  { id: 'video', name: 'Video Call', icon: 'video-camera', description: 'Face-to-face video consultation' },
  { id: 'audio', name: 'Voice Call', icon: 'phone', description: 'Audio-only consultation' },
  { id: 'chat', name: 'Chat', icon: 'chat-bubble-left-right', description: 'Text-based consultation' },
];
