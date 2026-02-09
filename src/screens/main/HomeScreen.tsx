import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { RootStackParamList, Doctor, Appointment } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data for demonstration
const UPCOMING_APPOINTMENT: Appointment = {
  id: '1',
  patientId: 'p1',
  doctorId: 'd1',
  doctorName: 'Dr. Sarah Johnson',
  doctorSpecialty: 'General Physician',
  date: '2026-02-10',
  time: '10:00 AM',
  status: 'scheduled',
  type: 'video',
};

const TOP_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah@telemed.com',
    role: 'doctor',
    specialty: 'General Physician',
    qualifications: ['MBBS', 'MD'],
    experience: 12,
    rating: 4.8,
    consultationFee: 50,
    bio: 'Experienced general physician with expertise in preventive care.',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'michael@telemed.com',
    role: 'doctor',
    specialty: 'Cardiologist',
    qualifications: ['MBBS', 'DM Cardiology'],
    experience: 15,
    rating: 4.9,
    consultationFee: 80,
    bio: 'Renowned cardiologist specializing in heart diseases.',
  },
  {
    id: '3',
    name: 'Dr. Emily Davis',
    email: 'emily@telemed.com',
    role: 'doctor',
    specialty: 'Dermatologist',
    qualifications: ['MBBS', 'MD Dermatology'],
    experience: 8,
    rating: 4.7,
    consultationFee: 60,
    bio: 'Skin care specialist with expertise in cosmetic dermatology.',
  },
];

const QUICK_SERVICES = [
  { id: '1', name: 'AI Symptom\nChecker', icon: 'analytics', color: Colors.primary, route: 'SymptomChecker' },
  { id: '2', name: 'Find\nDoctors', icon: 'medical', color: Colors.secondary, route: 'Doctors' },
  { id: '3', name: 'Book\nAppointment', icon: 'calendar', color: Colors.accent, route: 'Doctors' },
  { id: '4', name: 'Medical\nRecords', icon: 'document-text', color: Colors.info, route: 'MedicalRecords' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const renderQuickService = ({ item }: { item: typeof QUICK_SERVICES[0] }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => {
        if (item.route === 'SymptomChecker') {
          navigation.navigate('SymptomChecker');
        }
      }}
    >
      <View style={[styles.serviceIconContainer, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={28} color={item.color} />
      </View>
      <Text style={styles.serviceName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorProfile', { doctorId: item.id })}
    >
      <View style={styles.doctorAvatar}>
        <Ionicons name="person" size={32} color={Colors.primary} />
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
        <View style={styles.doctorMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.experienceText}>{item.experience} yrs exp</Text>
        </View>
      </View>
      <Text style={styles.doctorFee}>${item.consultationFee}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.username}>John Doe</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>Search doctors, symptoms...</Text>
        </TouchableOpacity>

        {/* AI Health Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => navigation.navigate('SymptomChecker')}
        >
          <View style={styles.aiBannerContent}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={28} color={Colors.textWhite} />
            </View>
            <View style={styles.aiBannerText}>
              <Text style={styles.aiBannerTitle}>AI Health Assistant</Text>
              <Text style={styles.aiBannerSubtitle}>
                Describe your symptoms and get instant AI-powered health insights
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textWhite} />
        </TouchableOpacity>

        {/* Quick Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Services</Text>
          <FlatList
            horizontal
            data={QUICK_SERVICES}
            renderItem={renderQuickService}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesContainer}
          />
        </View>

        {/* Upcoming Appointment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <View style={styles.doctorAvatar}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentDoctorName}>
                  {UPCOMING_APPOINTMENT.doctorName}
                </Text>
                <Text style={styles.appointmentDoctorSpecialty}>
                  {UPCOMING_APPOINTMENT.doctorSpecialty}
                </Text>
              </View>
              <View style={[styles.appointmentType, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="videocam" size={16} color={Colors.primary} />
              </View>
            </View>
            <View style={styles.appointmentDetails}>
              <View style={styles.appointmentDetailItem}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.appointmentDetailText}>
                  {UPCOMING_APPOINTMENT.date}
                </Text>
              </View>
              <View style={styles.appointmentDetailItem}>
                <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.appointmentDetailText}>
                  {UPCOMING_APPOINTMENT.time}
                </Text>
              </View>
            </View>
            <View style={styles.appointmentActions}>
              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => navigation.navigate('Consultation', { appointmentId: UPCOMING_APPOINTMENT.id })}
              >
                <Text style={styles.joinButtonText}>Join Call</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* Top Doctors */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Doctors</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {TOP_DOCTORS.map((doctor) => (
            <View key={doctor.id}>{renderDoctor({ item: doctor })}</View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  username: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    ...Shadows.small,
  },
  searchPlaceholder: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.xl,
    borderRadius: 16,
    padding: Spacing.lg,
  },
  aiBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  aiBannerText: {
    flex: 1,
  },
  aiBannerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textWhite,
    marginBottom: Spacing.xs,
  },
  aiBannerSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  servicesContainer: {
    paddingHorizontal: Spacing.lg,
  },
  serviceCard: {
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    width: 80,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  serviceName: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: Typography.fontWeights.medium,
  },
  appointmentCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: 16,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  appointmentDoctorName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  appointmentDoctorSpecialty: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  appointmentType: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentDetails: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  appointmentDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  appointmentDetailText: {
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  joinButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textWhite,
    fontWeight: Typography.fontWeights.medium,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    borderRadius: 12,
    padding: Spacing.md,
    ...Shadows.small,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  doctorName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  ratingText: {
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  experienceText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  doctorFee: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
});
