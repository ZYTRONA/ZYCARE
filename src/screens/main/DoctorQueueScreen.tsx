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
import { Colors, Typography, Spacing } from '../../constants/theme';
import socketService from '../../services/socket';
import { useAuthStore } from '../../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface QueuePatient {
  id: string;
  tokenNumber: number;
  name: string;
  age: number;
  gender: string;
  symptoms: string;
  priority: 'high' | 'medium' | 'normal';
  estimatedTime: string;
  status: 'waiting' | 'in-consultation' | 'completed';
  appointmentTime: string;
}

export default function DoctorQueueScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [patients, setPatients] = useState<QueuePatient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<QueuePatient | null>(null);

  useEffect(() => {
    loadQueue();

    // Setup Socket.io connection
    if (user) {
      socketService.connect(user.id, 'doctor');
    }

    // Listen for queue updates
    const handleQueueUpdate = (data: any) => {
      console.log('🔄 Queue updated:', data);
      loadQueue();
    };

    const handleDoctorStatusUpdate = (data: any) => {
      console.log('📊 Doctor status updated:', data);
    };

    socketService.on('queue_updated', handleQueueUpdate);
    socketService.on('doctor_status_update', handleDoctorStatusUpdate);

    return () => {
      socketService.off('queue_updated', handleQueueUpdate);
      socketService.off('doctor_status_update', handleDoctorStatusUpdate);
    };
  }, [user]);

  const loadQueue = async () => {
    try {
      // TODO: Fetch from API with Socket.io real-time updates
      const mockPatients: QueuePatient[] = [
        {
          id: '1',
          tokenNumber: 101,
          name: 'Rajesh Kumar',
          age: 45,
          gender: 'Male',
          symptoms: 'Fever, headache, body pain',
          priority: 'high',
          estimatedTime: '5 min',
          status: 'waiting',
          appointmentTime: '09:30 AM',
        },
        {
          id: '2',
          tokenNumber: 102,
          name: 'Priya Sharma',
          age: 32,
          gender: 'Female',
          symptoms: 'Cold, cough',
          priority: 'normal',
          estimatedTime: '15 min',
          status: 'waiting',
          appointmentTime: '09:45 AM',
        },
        {
          id: '3',
          tokenNumber: 103,
          name: 'Amit Patel',
          age: 28,
          gender: 'Male',
          symptoms: 'Stomach ache, nausea',
          priority: 'medium',
          estimatedTime: '25 min',
          status: 'waiting',
          appointmentTime: '10:00 AM',
        },
      ];
      setPatients(mockPatients);
    } catch (error) {
      console.error('Error loading queue:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQueue();
    setRefreshing(false);
  };

  const handleStartConsultation = (patient: QueuePatient) => {
    Alert.alert(
      'Start Consultation',
      `Start video consultation with ${patient.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            setCurrentPatient(patient);
            // Navigate to video call screen with patient data
            navigation.navigate('VideoCall', { 
              patientId: patient.id,
              patientName: patient.name,
              patientData: {
                age: patient.age,
                gender: patient.gender,
                symptoms: patient.symptoms,
              }
            });
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      default:
        return '#4CAF50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Urgent';
      case 'medium':
        return 'Medium';
      default:
        return 'Normal';
    }
  };

  const renderPatient = ({ item, index }: { item: QueuePatient; index: number }) => (
    <View style={styles.patientCard}>
      <View style={styles.patientHeader}>
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenNumber}>#{item.tokenNumber}</Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(item.priority) + '20' },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor(item.priority) },
              ]}
            >
              {getPriorityLabel(item.priority)}
            </Text>
          </View>
        </View>
        <Text style={styles.estimatedTime}>
          <Ionicons name="time-outline" size={14} /> {item.estimatedTime}
        </Text>
      </View>

      <View style={styles.patientInfo}>
        <View style={styles.avatarContainer}>
          <Ionicons
            name={item.gender === 'Male' ? 'man' : 'woman'}
            size={32}
            color={Colors.primary}
          />
        </View>
        <View style={styles.patientDetails}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientMeta}>
            {item.age} years • {item.gender}
          </Text>
          <View style={styles.symptomsContainer}>
            <Ionicons name="medical" size={14} color="#666" />
            <Text style={styles.symptoms} numberOfLines={2}>
              {item.symptoms}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.patientActions}>
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() => {
            // View patient details
            Alert.alert('Patient Details', JSON.stringify(item, null, 2));
          }}
        >
          <Ionicons name="eye-outline" size={20} color={Colors.primary} />
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>

        {index === 0 && (
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartConsultation(item)}
          >
            <Ionicons name="videocam" size={20} color="#FFF" />
            <Text style={styles.startButtonText}>Start Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Patient Queue</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Queue Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{patients.length}</Text>
          <Text style={styles.summaryLabel}>In Queue</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {patients.filter((p) => p.priority === 'high').length}
          </Text>
          <Text style={styles.summaryLabel}>Urgent</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>~25m</Text>
          <Text style={styles.summaryLabel}>Avg Time</Text>
        </View>
      </View>

      {/* Patient List */}
      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No patients in queue</Text>
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
  listContent: {
    padding: Spacing.md,
  },
  patientCard: {
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
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#666',
  },
  patientInfo: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
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
  patientActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  viewDetailsText: {
    color: Colors.primary,
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
