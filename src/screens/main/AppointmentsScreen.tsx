import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { RootStackParamList, Appointment } from '../../types';
import { useAuthStore, useLanguageStore } from '../../store';
import { appointmentsAPI } from '../../services/api';
import { t, LanguageCode } from '../../languages';
import { socketService } from '../../services/socket';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabType = 'upcoming' | 'completed' | 'cancelled';

export default function AppointmentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state: any) => state.user);
  const language = useLanguageStore((state: any) => state.language) as LanguageCode;
  
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        console.log('📅 Fetching all appointments for user:', user.id);
        const response = await appointmentsAPI.getAll(user.id);
        console.log('✅ Appointments fetched:', response);
        setAppointments(response);
      } catch (err: any) {
        console.error('❌ Error fetching appointments:', err);
        // API will have tried fallback - silently handle
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
    
    // Connect to Socket.io
    if (user?.id) {
      socketService.connect(user.id, user.role === 'doctor' ? 'doctor' : 'patient');
      
      // Listen for new appointment confirmations
      socketService.onAppointmentConfirmed((appointment: Appointment) => {
        console.log('🔔 Appointment confirmed via Socket.io:', appointment);
        setAppointments((prev) => [appointment, ...prev]);
      });
    }
    
    // Cleanup
    return () => {
      socketService.offAppointmentConfirmed();
    };
  }, [user?.id]);

  const getFilteredAppointments = () => {
    if (isLoading) return [];
    
    switch (activeTab) {
      case 'upcoming':
        return appointments.filter((a) => a.status === 'scheduled' || a.status === 'in-progress');
      case 'completed':
        return appointments.filter((a) => a.status === 'completed');
      case 'cancelled':
        return appointments.filter((a) => a.status === 'cancelled');
      default:
        return [];
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return 'videocam';
      case 'audio':
        return 'call';
      case 'chat':
        return 'chatbubble';
      default:
        return 'videocam';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return Colors.primary;
      case 'in-progress':
        return Colors.secondary;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <TouchableOpacity style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.doctorAvatar}>
          <Ionicons name="person" size={28} color={Colors.primary} />
        </View>
        <View style={styles.appointmentInfo}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={styles.doctorSpecialty}>{item.doctorSpecialty}</Text>
        </View>
        <View
          style={[
            styles.appointmentType,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Ionicons
            name={getTypeIcon(item.type) as any}
            size={18}
            color={getStatusColor(item.status)}
          />
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      {item.status === 'scheduled' && (
        <View style={styles.appointmentActions}>
          <TouchableOpacity style={styles.rescheduleButton}>
            <Ionicons name="calendar" size={18} color={Colors.primary} />
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => navigation.navigate('Consultation', { appointmentId: item.id })}
          >
            <Ionicons name={getTypeIcon(item.type) as any} size={18} color={Colors.textWhite} />
            <Text style={styles.joinButtonText}>
              {item.type === 'chat' ? t(language, 'common.startChat', 'Start Chat') : t(language, 'home.joinCall', 'Join Call')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'completed' && (
        <View style={styles.appointmentActions}>
          <TouchableOpacity style={styles.viewDetailsButton}>
            <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rebookButton}>
            <Ionicons name="refresh" size={18} color={Colors.textWhite} />
            <Text style={styles.rebookButtonText}>Book Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t(language, 'appointments.myAppointments', 'My Appointments')}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          { key: 'upcoming' as TabType, label: t(language, 'appointments.upcoming', 'Upcoming') },
          { key: 'completed' as TabType, label: t(language, 'appointments.completed', 'Completed') },
          { key: 'cancelled' as TabType, label: t(language, 'appointments.cancelled', 'Cancelled') },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Appointments List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t(language, 'common.loading', 'Loading')} {activeTab} {t(language, 'appointments.appointments', 'appointments')}...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setIsLoading(true);
              setError(null);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={getFilteredAppointments()}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>{t(language, 'appointments.noAppointments', 'No appointments')}</Text>
              <Text style={styles.emptyStateSubtext}>
                {activeTab === 'upcoming'
                  ? t(language, 'appointments.bookToStart', 'Book an appointment with a doctor to get started')
                  : t(language, 'appointments.appearsHere', 'Your appointments will appear here')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.xs,
    ...Shadows.small,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeights.medium,
  },
  tabTextActive: {
    color: Colors.textWhite,
  },
  listContainer: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  appointmentCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
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
  doctorName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  appointmentType: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.semibold,
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rescheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  rescheduleButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  joinButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textWhite,
    fontWeight: Typography.fontWeights.medium,
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  viewDetailsButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  rebookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
  },
  rebookButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textWhite,
    fontWeight: Typography.fontWeights.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyStateText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  emptyStateSubtext: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  loadingText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  errorText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.error,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  retryButtonText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textWhite,
    fontWeight: Typography.fontWeights.medium,
  },
});
