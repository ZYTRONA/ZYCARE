import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList, MainTabParamList } from '../types';
import { Colors } from '../constants/theme';
import { useAuthStore } from '../store';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import DoctorsScreen from '../screens/main/DoctorsScreen';
import AppointmentsScreen from '../screens/main/AppointmentsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Feature Screens
import DoctorProfileScreen from '../screens/DoctorProfileScreen';
import BookAppointmentScreen from '../screens/BookAppointmentScreen';
import SymptomCheckerScreen from '../screens/SymptomCheckerScreen';
import ConsultationScreen from '../screens/ConsultationScreen';
import ChatScreen from '../screens/ChatScreen';
import AIChatNew from '../screens/main/AIChatNew';

// Settings Screens
import PersonalInformationScreen from '../screens/settings/PersonalInformationScreen';
import MedicalRecordsScreen from '../screens/settings/MedicalRecordsScreen';
import NotificationsScreen from '../screens/settings/NotificationsScreen';
import PrivacySecurityScreen from '../screens/settings/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/settings/HelpSupportScreen';
import AboutScreen from '../screens/settings/AboutScreen';
import LanguageSelectionScreen from '../screens/LanguageSelectionScreen';

// Video Call Screen
import VideoCallScreen from '../screens/main/VideoCallScreen';

// Doctor Screens
import DoctorDashboardNew from '../screens/main/DoctorDashboardNew';
import DoctorQueueScreen from '../screens/main/DoctorQueueScreen';
import DoctorPrescriptionScreen from '../screens/main/DoctorPrescriptionScreen';
import DoctorScheduleScreen from '../screens/main/DoctorScheduleScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Doctors':
              iconName = focused ? 'medical' : 'medical-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.cardBackground,
          borderTopColor: Colors.border,
          paddingBottom: insets.bottom + 5,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Doctors" component={DoctorsScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const user = useAuthStore((state: any) => state.user);
  const isDoctor = user?.role === 'doctor';

  return (
    <NavigationContainer>
      {isAuthenticated && user ? (
        // Authenticated User Stack
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
          initialRouteName={isDoctor ? 'DoctorDashboard' : 'MainTabs'}
        >
          {isDoctor ? (
            // Doctor Routes
            <>
              <Stack.Screen name="DoctorDashboard" component={DoctorDashboardNew} />
              <Stack.Screen name="DoctorQueue" component={DoctorQueueScreen} />
              <Stack.Screen name="DoctorPrescription" component={DoctorPrescriptionScreen} />
              <Stack.Screen name="DoctorSchedule" component={DoctorScheduleScreen} />
              <Stack.Screen
                name="VideoCall"
                component={VideoCallScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false }}
              />
            </>
          ) : (
            // Patient Routes
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
            </>
          )}
          
          {/* Common Routes */}
          <Stack.Screen
            name="DoctorProfile"
            component={DoctorProfileScreen}
            options={{ headerShown: true, title: 'Doctor Profile' }}
          />
          <Stack.Screen
            name="BookAppointment"
            component={BookAppointmentScreen}
            options={{ headerShown: true, title: 'Book Appointment' }}
          />
          <Stack.Screen
            name="SymptomChecker"
            component={SymptomCheckerScreen}
            options={{ headerShown: true, title: 'AI Symptom Checker' }}
          />
          <Stack.Screen
            name="PersonalInformation"
            component={PersonalInformationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MedicalRecords"
            component={MedicalRecordsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PrivacySecurity"
            component={PrivacySecurityScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HelpSupport"
            component={HelpSupportScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Consultation"
            component={ConsultationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{ headerShown: true, title: 'Chat' }}
          />
          <Stack.Screen
            name="Chat"
            component={AIChatNew}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="LanguageSelection"
            component={LanguageSelectionScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      ) : (
        // Unauthenticated User Stack
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
