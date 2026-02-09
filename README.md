# TeleMed AI - Telemedicine & Online Consultation App

An AI-powered telemedicine mobile application built with React Native and Expo, designed to provide healthcare access to remote areas through virtual consultations.

## Features

### Core Features
- **AI Symptom Checker**: Describe your symptoms and get AI-powered health insights and recommendations
- **Doctor Search & Booking**: Find doctors by specialty and book video, audio, or chat consultations
- **Video/Audio Consultations**: Real-time video and voice calls with healthcare providers
- **Chat Consultations**: Text-based consultations with doctors
- **Appointment Management**: View, reschedule, or cancel appointments

### User Features
- User authentication (Login/Register)
- Patient and Doctor roles
- Profile management
- Medical records storage
- Health information tracking

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **UI Components**: Custom styled components with Expo Vector Icons
- **State Management**: React Hooks (useState, useEffect, useRef)

## Project Structure

```
telemedicine-app/
├── App.tsx                          # Main application entry
├── src/
│   ├── constants/
│   │   └── theme.ts                 # Colors, typography, spacing, and app constants
│   ├── navigation/
│   │   └── AppNavigator.tsx         # Navigation configuration
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx      # User login
│   │   │   └── RegisterScreen.tsx   # User registration
│   │   ├── main/
│   │   │   ├── HomeScreen.tsx       # Dashboard with quick actions
│   │   │   ├── DoctorsScreen.tsx    # Doctor search and listing
│   │   │   ├── AppointmentsScreen.tsx # Appointment management
│   │   │   └── ProfileScreen.tsx    # User profile and settings
│   │   ├── BookAppointmentScreen.tsx # Appointment booking flow
│   │   ├── ChatScreen.tsx           # Chat consultation
│   │   ├── ConsultationScreen.tsx   # Video/audio call interface
│   │   ├── DoctorProfileScreen.tsx  # Doctor details and reviews
│   │   └── SymptomCheckerScreen.tsx # AI symptom analysis
│   ├── services/
│   │   └── api.ts                   # API service functions
│   └── types/
│       └── index.ts                 # TypeScript type definitions
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on physical device

### Installation

1. Navigate to the project directory:
   ```bash
   cd telemedicine-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   - Press `a` for Android
   - Press `i` for iOS (Mac only)
   - Press `w` for web
   - Scan the QR code with Expo Go app on your phone

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start on Android emulator/device
- `npm run ios` - Start on iOS simulator/device
- `npm run web` - Start in web browser

## Key Screens

### 1. Home Screen
- Quick access to AI symptom checker
- Upcoming appointments
- Top-rated doctors
- Quick service navigation

### 2. AI Symptom Checker
- Select from common symptoms
- Specify duration
- Get AI-powered analysis
- View possible conditions with probability
- Receive personalized recommendations

### 3. Doctor Profiles
- Doctor qualifications and experience
- Patient reviews and ratings
- Consultation options (video, audio, chat)
- Available time slots
- Easy booking

### 4. Consultation Screens
- Video call interface with controls
- Chat messaging with doctors
- Real-time communication indicators
- File/image sharing capabilities

## Future Enhancements

- [ ] Backend integration with real APIs
- [ ] Real video calling with WebRTC/Agora SDK
- [ ] Push notifications for appointments
- [ ] Payment integration
- [ ] Electronic prescriptions
- [ ] Multi-language support
- [ ] Offline mode support
- [ ] Health metrics tracking with wearables

## Design System

The app uses a consistent design system defined in `src/constants/theme.ts`:

- **Primary Color**: #4A90D9 (Blue)
- **Secondary Color**: #27AE60 (Green)
- **Accent Color**: #F39C12 (Orange)
- **Background**: #F8FAFC (Light gray)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Expo team for the amazing development platform
- React Navigation for seamless navigation
- Ionicons for beautiful icons
