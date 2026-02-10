import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { RootStackParamList, Doctor } from '../types';
import { useAuthStore } from '../store';
import { appointmentsAPI } from '../services/api';
import { socketService } from '../services/socket';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'BookAppointment'>;

// Mock data
const DATES = [
  { date: '10', day: 'Mon', month: 'Feb' },
  { date: '11', day: 'Tue', month: 'Feb' },
  { date: '12', day: 'Wed', month: 'Feb' },
  { date: '13', day: 'Thu', month: 'Feb' },
  { date: '14', day: 'Fri', month: 'Feb' },
  { date: '15', day: 'Sat', month: 'Feb' },
  { date: '16', day: 'Sun', month: 'Feb' },
];

const TIME_SLOTS = {
  morning: ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'],
  afternoon: ['2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'],
  evening: ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM'],
};

type ConsultationType = 'video' | 'audio' | 'chat';

export default function BookAppointmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const user = useAuthStore((state: any) => state.user);

  // Get doctor from route params
  const doctor = route.params?.doctor as Doctor | undefined;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<ConsultationType>('video');
  const [symptoms, setSymptoms] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Missing Information', 'Please select both date and time');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Please login to book an appointment');
      return;
    }

    if (!doctor?.id) {
      Alert.alert('Error', 'Doctor information is missing');
      return;
    }

    setIsBooking(true);

    try {
      // Format date as YYYY-MM-DD
      const year = 2026;
      const month = 'Feb';
      const formattedDate = `${year}-02-${selectedDate.padStart(2, '0')}`;

      console.log('📅 Booking appointment:', {
        patientId: user.id,
        patientName: user.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        date: formattedDate,
        time: selectedTime,
        type: consultationType,
        symptoms,
      });

      const appointment = await appointmentsAPI.createAppointment({
        patientId: user.id,
        patientName: user.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        date: formattedDate,
        time: selectedTime,
        type: consultationType,
        symptoms,
      });

      console.log('✅ Appointment created:', appointment);

      // Connect to socket if not already connected
      if (!socketService.isConnected()) {
        socketService.connect(user.id, 'patient');
      }

      Alert.alert(
        'Success! 🎉',
        `Your appointment has been booked for ${formattedDate} at ${selectedTime}`,
        [
          {
            text: 'View Appointments',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Appointments' }),
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error booking appointment:', error);
      Alert.alert(
        'Booking Failed',
        error?.message || 'Unable to book appointment. Please try again.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  const getConsultationFee = () => {
    switch (consultationType) {
      case 'video':
        return 50;
      case 'audio':
        return 40;
      case 'chat':
        return 30;
      default:
        return 50;
    }
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
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Doctor Info Summary */}
        <View style={styles.doctorSummary}>
          <View style={styles.doctorAvatar}>
            <Ionicons name="person" size={32} color={Colors.primary} />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor?.name || 'Doctor'}</Text>
            <Text style={styles.doctorSpecialty}>{doctor?.specialty || 'Specialist'}</Text>
          </View>
        </View>

        {/* Consultation Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Type</Text>
          <View style={styles.consultationTypes}>
            <TouchableOpacity
              style={[
                styles.consultationTypeCard,
                consultationType === 'video' && styles.consultationTypeCardActive,
              ]}
              onPress={() => setConsultationType('video')}
            >
              <Ionicons
                name="videocam"
                size={28}
                color={consultationType === 'video' ? Colors.textWhite : Colors.primary}
              />
              <Text
                style={[
                  styles.consultationTypeText,
                  consultationType === 'video' && styles.consultationTypeTextActive,
                ]}
              >
                Video
              </Text>
              <Text
                style={[
                  styles.consultationTypePrice,
                  consultationType === 'video' && styles.consultationTypePriceActive,
                ]}
              >
                $50
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.consultationTypeCard,
                consultationType === 'audio' && styles.consultationTypeCardActive,
              ]}
              onPress={() => setConsultationType('audio')}
            >
              <Ionicons
                name="call"
                size={28}
                color={consultationType === 'audio' ? Colors.textWhite : Colors.secondary}
              />
              <Text
                style={[
                  styles.consultationTypeText,
                  consultationType === 'audio' && styles.consultationTypeTextActive,
                ]}
              >
                Voice
              </Text>
              <Text
                style={[
                  styles.consultationTypePrice,
                  consultationType === 'audio' && styles.consultationTypePriceActive,
                ]}
              >
                $40
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.consultationTypeCard,
                consultationType === 'chat' && styles.consultationTypeCardActive,
              ]}
              onPress={() => setConsultationType('chat')}
            >
              <Ionicons
                name="chatbubble"
                size={28}
                color={consultationType === 'chat' ? Colors.textWhite : Colors.accent}
              />
              <Text
                style={[
                  styles.consultationTypeText,
                  consultationType === 'chat' && styles.consultationTypeTextActive,
                ]}
              >
                Chat
              </Text>
              <Text
                style={[
                  styles.consultationTypePrice,
                  consultationType === 'chat' && styles.consultationTypePriceActive,
                ]}
              >
                $30
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.datesContainer}
          >
            {DATES.map((item) => {
              const isSelected = selectedDate === item.date;
              return (
                <TouchableOpacity
                  key={item.date}
                  style={[styles.dateCard, isSelected && styles.dateCardActive]}
                  onPress={() => setSelectedDate(item.date)}
                >
                  <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>
                    {item.day}
                  </Text>
                  <Text style={[styles.dateNumber, isSelected && styles.dateNumberActive]}>
                    {item.date}
                  </Text>
                  <Text style={[styles.dateMonth, isSelected && styles.dateMonthActive]}>
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>

          {/* Morning Slots */}
          <View style={styles.timeSection}>
            <View style={styles.timeLabelContainer}>
              <Ionicons name="sunny-outline" size={18} color={Colors.accent} />
              <Text style={styles.timeLabel}>Morning</Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {TIME_SLOTS.morning.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeSlot, isSelected && styles.timeSlotActive]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Afternoon Slots */}
          <View style={styles.timeSection}>
            <View style={styles.timeLabelContainer}>
              <Ionicons name="partly-sunny-outline" size={18} color={Colors.accent} />
              <Text style={styles.timeLabel}>Afternoon</Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {TIME_SLOTS.afternoon.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeSlot, isSelected && styles.timeSlotActive]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Evening Slots */}
          <View style={styles.timeSection}>
            <View style={styles.timeLabelContainer}>
              <Ionicons name="moon-outline" size={18} color={Colors.info} />
              <Text style={styles.timeLabel}>Evening</Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {TIME_SLOTS.evening.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timeSlot, isSelected && styles.timeSlotActive]}
                    onPress={() => setSelectedTime(time)}
                  >
                    <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Symptoms Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe Your Symptoms (Optional)</Text>
          <TextInput
            style={styles.symptomsInput}
            placeholder="Brief description of your health concerns..."
            placeholderTextColor={Colors.textLight}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={symptoms}
            onChangeText={setSymptoms}
          />
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Consultation Type</Text>
            <Text style={styles.summaryValue}>
              {consultationType.charAt(0).toUpperCase() + consultationType.slice(1)} Call
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>
              {selectedDate ? `Feb ${selectedDate}, 2026` : 'Not selected'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>
              {selectedTime || 'Not selected'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{getConsultationFee()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDate || !selectedTime) && styles.bookButtonDisabled,
          ]}
          onPress={handleBookAppointment}
          disabled={!selectedDate || !selectedTime || isBooking}
        >
          <Text style={styles.bookButtonText}>
            {isBooking ? 'Booking...' : 'Confirm Booking'}
          </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
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
  headerTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  doctorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    borderRadius: 12,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    marginLeft: Spacing.md,
  },
  doctorName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  consultationTypes: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  consultationTypeCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  consultationTypeCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  consultationTypeText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  consultationTypeTextActive: {
    color: Colors.textWhite,
  },
  consultationTypePrice: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  consultationTypePriceActive: {
    color: Colors.textWhite,
  },
  datesContainer: {
    marginTop: Spacing.xs,
  },
  dateCard: {
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 70,
  },
  dateCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateDay: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  dateDayActive: {
    color: Colors.textWhite,
  },
  dateNumber: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginVertical: Spacing.xs,
  },
  dateNumberActive: {
    color: Colors.textWhite,
  },
  dateMonth: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  dateMonthActive: {
    color: Colors.textWhite,
  },
  timeSection: {
    marginBottom: Spacing.lg,
  },
  timeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  timeLabel: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSlotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  timeSlotTextActive: {
    color: Colors.textWhite,
  },
  symptomsInput: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.lg,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryCard: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxxl,
    borderRadius: 16,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  summaryTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeights.medium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  bottomBar: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  bookButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
  },
});
