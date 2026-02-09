import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { RootStackParamList, Appointment } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data
const APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    patientId: 'p1',
    doctorId: 'd1',
    doctorName: 'Dr. Sarah Johnson',
    doctorSpecialty: 'General Physician',
    date: '2026-02-10',
    time: '10:00 AM',
    status: 'scheduled',
    type: 'video',
  },
  {
    id: '2',
    patientId: 'p1',
    doctorId: 'd2',
    doctorName: 'Dr. Michael Chen',
    doctorSpecialty: 'Cardiologist',
    date: '2026-02-12',
    time: '2:30 PM',
    status: 'scheduled',
    type: 'audio',
  },
  {
    id: '3',
    patientId: 'p1',
    doctorId: 'd3',
    doctorName: 'Dr. Emily Davis',
    doctorSpecialty: 'Dermatologist',
    date: '2026-02-05',
    time: '11:00 AM',
    status: 'completed',
    type: 'video',
  },
  {
    id: '4',
    patientId: 'p1',
    doctorId: 'd4',
    doctorName: 'Dr. Robert Wilson',
    doctorSpecialty: 'Pediatrician',
    date: '2026-01-28',
    time: '9:00 AM',
    status: 'completed',
    type: 'chat',
  },
  {
    id: '5',
    patientId: 'p1',
    doctorId: 'd5',
    doctorName: 'Dr. Lisa Anderson',
    doctorSpecialty: 'Psychiatrist',
    date: '2026-01-20',
    time: '4:00 PM',
    status: 'cancelled',
    type: 'video',
  },
];

type TabType = 'upcoming' | 'completed' | 'cancelled';

export default function AppointmentsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'upcoming':
        return APPOINTMENTS.filter((a) => a.status === 'scheduled' || a.status === 'in-progress');
      case 'completed':
        return APPOINTMENTS.filter((a) => a.status === 'completed');
      case 'cancelled':
        return APPOINTMENTS.filter((a) => a.status === 'cancelled');
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
              {item.type === 'chat' ? 'Start Chat' : 'Join Call'}
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

  const tabs: { key: TabType; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
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
      <FlatList
        data={getFilteredAppointments()}
        renderItem={renderAppointment}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>No {activeTab} appointments</Text>
            <Text style={styles.emptyStateSubtext}>
              {activeTab === 'upcoming'
                ? 'Book an appointment with a doctor to get started'
                : 'Your appointments will appear here'}
            </Text>
          </View>
        }
      />
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
});
