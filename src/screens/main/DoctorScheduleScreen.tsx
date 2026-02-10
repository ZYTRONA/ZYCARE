import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, Spacing } from '../../constants/theme';
import socketService from '../../services/socket';
import { useAuthStore } from '../../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  date: string;
  time: string;
  type: 'video' | 'in-person';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  symptoms?: string;
  notes?: string;
}

export default function DoctorScheduleScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadAppointments();

    // Listen for new appointments
    const handleNewAppointment = (data: any) => {
      loadAppointments();
    };

    socketService.on('new_appointment', handleNewAppointment);

    return () => {
      socketService.off('new_appointment', handleNewAppointment);
    };
  }, []);

  const loadAppointments = async () => {
    try {
      // TODO: Fetch from API
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patientId: 'p1',
          patientName: 'Rajesh Kumar',
          patientAge: 45,
          patientGender: 'Male',
          date: '2026-02-10',
          time: '09:30 AM',
          type: 'video',
          status: 'scheduled',
          symptoms: 'Fever, headache',
        },
        {
          id: '2',
          patientId: 'p2',
          patientName: 'Priya Sharma',
          patientAge: 32,
          patientGender: 'Female',
          date: '2026-02-10',
          time: '10:15 AM',
          type: 'video',
          status: 'scheduled',
          symptoms: 'Cold, cough',
        },
        {
          id: '3',
          patientId: 'p3',
          patientName: 'Amit Patel',
          patientAge: 28,
          patientGender: 'Male',
          date: '2026-02-10',
          time: '11:00 AM',
          type: 'in-person',
          status: 'scheduled',
          symptoms: 'Stomach ache',
        },
        {
          id: '4',
          patientId: 'p4',
          patientName: 'Sunita Reddy',
          patientAge: 38,
          patientGender: 'Female',
          date: '2026-02-10',
          time: '02:00 PM',
          type: 'video',
          status: 'completed',
          symptoms: 'Follow-up checkup',
        },
      ];
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#2196F3';
      case 'in-progress':
        return '#FF9800';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  const handleStartConsultation = (appointment: Appointment) => {
    navigation.navigate('VideoCall', {
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientData: {
        age: appointment.patientAge,
        gender: appointment.patientGender,
        symptoms: appointment.symptoms,
      },
    });
  };

  const handleCancelAppointment = (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // TODO: Call API to cancel
            setAppointments(prev =>
              prev.map(apt =>
                apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
              )
            );
          },
        },
      ]
    );
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={18} color={Colors.primary} />
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.patientInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons
            name={item.patientGender === 'Male' ? 'man' : 'woman'}
            size={32}
            color={Colors.primary}
          />
        </View>
        <View style={styles.patientDetails}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.patientMeta}>
            {item.patientAge} years • {item.patientGender}
          </Text>
          {item.symptoms && (
            <View style={styles.symptomsContainer}>
              <Ionicons name="medical" size={14} color="#666" />
              <Text style={styles.symptoms} numberOfLines={2}>
                {item.symptoms}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.appointmentType}>
        <Ionicons
          name={item.type === 'video' ? 'videocam' : 'location'}
          size={16}
          color="#666"
        />
        <Text style={styles.appointmentTypeText}>
          {item.type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
        </Text>
      </View>

      {item.status === 'scheduled' && (
        <View style={styles.appointmentActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item.id)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#F44336" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartConsultation(item)}
          >
            <Ionicons name="videocam" size={20} color="#FFF" />
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const todayAppointments = appointments.filter(apt => apt.date === '2026-02-10');
  const scheduled = todayAppointments.filter(apt => apt.status === 'scheduled').length;
  const completed = todayAppointments.filter(apt => apt.status === 'completed').length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{todayAppointments.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{scheduled}</Text>
          <Text style={styles.summaryLabel}>Scheduled</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{completed}</Text>
          <Text style={styles.summaryLabel}>Completed</Text>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateButton}>
          <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
          <Text style={styles.dateText}>Today, Feb 10</Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <FlatList
        data={todayAppointments}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No appointments scheduled</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  refreshButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  dateSelector: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dateText: {
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  appointmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  patientInfo: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  patientMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  symptomsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  symptoms: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginLeft: 4,
  },
  appointmentType: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  appointmentTypeText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  cancelButtonText: {
    color: '#F44336',
    marginLeft: 6,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
