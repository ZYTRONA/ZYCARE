import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, Spacing } from '../../constants/theme';
import socketService from '../../services/socket';
import { useAuthStore } from '../../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface QueueStatus {
  position: number;
  tokenNumber: number;
  estimatedWaitTime: string;
  doctorName: string;
  doctorStatus: 'available' | 'busy' | 'on-break';
  patientsAhead: number;
  appointmentTime?: string;
}

export default function PatientQueueStatusScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadQueueStatus();

    // Setup Socket.io connection
    if (user) {
      socketService.connect(user.id, 'patient');
    }

    // Listen for queue updates
    const handleQueueUpdate = (data: any) => {
      console.log('📊 Queue position updated:', data);
      setQueueStatus(prev => prev ? {
        ...prev,
        position: data.position,
        estimatedWaitTime: data.estimatedTime,
        patientsAhead: data.position - 1,
      } : null);
    };

    const handleConsultationStarted = (data: any) => {
      console.log('📹 Your consultation is starting!');
      // Navigate to video call
      navigation.navigate('VideoCall', {
        patientId: user?.id,
        doctorName: queueStatus?.doctorName,
      });
    };

    const handleDoctorAvailability = (data: any) => {
      console.log('🔔 Doctor availability changed:', data);
      setQueueStatus(prev => prev ? {
        ...prev,
        doctorStatus: data.status,
      } : null);
    };

    socketService.on('queue_position_updated', handleQueueUpdate);
    socketService.on('consultation_started', handleConsultationStarted);
    socketService.on('doctor_availability_changed', handleDoctorAvailability);

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      socketService.off('queue_position_updated', handleQueueUpdate);
      socketService.off('consultation_started', handleConsultationStarted);
      socketService.off('doctor_availability_changed', handleDoctorAvailability);
    };
  }, [user]);

  const loadQueueStatus = async () => {
    try {
      // TODO: Fetch from API
      const mockStatus: QueueStatus = {
        position: 3,
        tokenNumber: 103,
        estimatedWaitTime: '15-20 min',
        doctorName: 'Dr. Sarah Johnson',
        doctorStatus: 'available',
        patientsAhead: 2,
        appointmentTime: '10:30 AM',
      };
      setQueueStatus(mockStatus);
    } catch (error) {
      console.error('Error loading queue status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQueueStatus();
    setRefreshing(false);
  };

  const getDoctorStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'busy':
        return '#FF9800';
      case 'on-break':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getDoctorStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'In Consultation';
      case 'on-break':
        return 'On Break';
      default:
        return 'Unknown';
    }
  };

  if (!queueStatus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="time-outline" size={64} color="#CCC" />
          <Text style={styles.loadingText}>Loading queue status...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Queue Status</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Token Number - Big Display */}
        <View style={styles.tokenCard}>
          <Text style={styles.tokenLabel}>Your Token Number</Text>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text style={styles.tokenNumber}>#{queueStatus.tokenNumber}</Text>
          </Animated.View>
          <Text style={styles.appointmentTime}>
            Appointment: {queueStatus.appointmentTime || 'Walk-in'}
          </Text>
        </View>

        {/* Queue Position */}
        <View style={styles.positionCard}>
          <View style={styles.positionHeader}>
            <Ionicons name="people-outline" size={32} color={Colors.primary} />
            <View style={styles.positionInfo}>
              <Text style={styles.positionLabel}>Your Position</Text>
              <Text style={styles.positionNumber}>
                {queueStatus.position}
                <Text style={styles.positionTotal}> in queue</Text>
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={24} color="#666" />
              <Text style={styles.infoLabel}>Estimated Wait</Text>
              <Text style={styles.infoValue}>{queueStatus.estimatedWaitTime}</Text>
            </View>

            <View style={styles.infoItemDivider} />

            <View style={styles.infoItem}>
              <Ionicons name="hourglass-outline" size={24} color="#666" />
              <Text style={styles.infoLabel}>Patients Ahead</Text>
              <Text style={styles.infoValue}>{queueStatus.patientsAhead}</Text>
            </View>
          </View>
        </View>

        {/* Doctor Status */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorHeader}>
            <Ionicons name="medical" size={28} color={Colors.primary} />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{queueStatus.doctorName}</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getDoctorStatusColor(queueStatus.doctorStatus) },
                  ]}
                />
                <Text style={styles.doctorStatus}>
                  {getDoctorStatusLabel(queueStatus.doctorStatus)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.instructionText}>
              Please stay nearby when your turn approaches
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.instructionText}>
              You'll receive a notification when it's your turn
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            <Text style={styles.instructionText}>
              Keep your camera and microphone ready for video call
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Navigate to chat with doctor
              navigation.navigate('ChatScreen', {
                appointmentId: 'temp',
                doctorName: queueStatus.doctorName,
              });
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Message Doctor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {
              // TODO: Cancel appointment
            }}
          >
            <Ionicons name="close-circle-outline" size={20} color="#F44336" />
            <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
              Cancel Appointment
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
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
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  tokenCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tokenLabel: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 8,
  },
  tokenNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 8,
  },
  positionCard: {
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
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  positionInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  positionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  positionNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  positionTotal: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoItemDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: Spacing.sm,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  doctorCard: {
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
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  doctorStatus: {
    fontSize: 14,
    color: '#666',
  },
  instructionsCard: {
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
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: Spacing.sm,
    flex: 1,
  },
  actionsContainer: {
    marginTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    elevation: 1,
  },
  actionButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    borderColor: '#F44336',
  },
  cancelButtonText: {
    color: '#F44336',
  },
});
