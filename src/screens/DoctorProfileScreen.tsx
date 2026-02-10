import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { RootStackParamList, Doctor } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'DoctorProfile'>;

// Mock doctor data
const MOCK_DOCTOR: Doctor = {
  id: '1',
  name: 'Dr. Sarah Johnson',
  email: 'sarah@telemed.com',
  role: 'doctor',
  specialty: 'General Physician',
  qualifications: ['MBBS', 'MD Internal Medicine'],
  experience: 12,
  rating: 4.8,
  consultationFee: 50,
  bio: 'Dr. Sarah Johnson is a highly experienced general physician with over 12 years of practice. She specializes in preventive care, chronic disease management, and primary healthcare. Dr. Johnson is known for her patient-centered approach and commitment to providing comprehensive medical care.',
};

const REVIEWS = [
  {
    id: '1',
    patientName: 'John D.',
    rating: 5,
    date: '2026-01-28',
    comment: 'Very thorough and caring doctor. She took time to explain everything.',
  },
  {
    id: '2',
    patientName: 'Mary S.',
    rating: 4,
    date: '2026-01-15',
    comment: 'Great experience! Professional and knowledgeable.',
  },
  {
    id: '3',
    patientName: 'Robert K.',
    rating: 5,
    date: '2026-01-05',
    comment: 'Excellent doctor. Highly recommend for any health concerns.',
  },
];

const AVAILABLE_TIMES = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
];

export default function DoctorProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const doctor = MOCK_DOCTOR; // In real app, fetch based on route.params.doctorId

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
          size={16}
          color={Colors.accent}
        />
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {/* Doctor Info Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="person" size={60} color={Colors.primary} />
          </View>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
          <Text style={styles.doctorQualifications}>
            {doctor.qualifications.join(' | ')}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>1000+</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.statValue}>{doctor.experience}+</Text>
              <Text style={styles.statLabel}>Years Exp</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={20} color={Colors.accent} />
              </View>
              <Text style={styles.statValue}>{doctor.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="chatbubbles" size={20} color={Colors.info} />
              </View>
              <Text style={styles.statValue}>500+</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{doctor.bio}</Text>
        </View>

        {/* Consultation Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Options</Text>
          <View style={styles.consultationOptions}>
            <View style={styles.consultationOption}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="videocam" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.optionTitle}>Video Call</Text>
              <Text style={styles.optionPrice}>₹{doctor.consultationFee}</Text>
            </View>
            <View style={styles.consultationOption}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.secondary + '20' }]}>
                <Ionicons name="call" size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.optionTitle}>Voice Call</Text>
              <Text style={styles.optionPrice}>₹{doctor.consultationFee - 50}</Text>
            </View>
            <View style={styles.consultationOption}>
              <View style={[styles.optionIcon, { backgroundColor: Colors.accent + '20' }]}>
                <Ionicons name="chatbubble" size={24} color={Colors.accent} />
              </View>
              <Text style={styles.optionTitle}>Chat</Text>
              <Text style={styles.optionPrice}>₹{doctor.consultationFee - 100}</Text>
            </View>
          </View>
        </View>

        {/* Available Times */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Today</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.timesContainer}
          >
            {AVAILABLE_TIMES.map((time, index) => (
              <TouchableOpacity key={index} style={styles.timeSlot}>
                <Text style={styles.timeSlotText}>{time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Patient Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitial}>
                      {review.patientName.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>{review.patientName}</Text>
                    <View style={styles.starsContainer}>
                      {renderStars(review.rating)}
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Consultation Fee</Text>
          <Text style={styles.priceValue}>₹{doctor.consultationFee}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookAppointment', { doctor })}
        >
          <Ionicons name="calendar" size={20} color={Colors.textWhite} />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
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
    padding: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
  doctorCard: {
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: 20,
    padding: Spacing.xl,
    marginTop: -Spacing.md,
    ...Shadows.medium,
  },
  doctorAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  doctorName: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  doctorQualifications: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  seeAllText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  bioText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  consultationOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  consultationOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.md,
    ...Shadows.small,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  optionTitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  optionPrice: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.bold,
    marginTop: Spacing.xs,
  },
  timesContainer: {
    marginTop: Spacing.xs,
  },
  timeSlot: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSlotText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  reviewCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  reviewerInitial: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  reviewerName: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  reviewDate: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textLight,
  },
  reviewComment: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadows.medium,
  },
  priceContainer: {
    marginRight: Spacing.xl,
  },
  priceLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
  },
  bookButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
  },
});
