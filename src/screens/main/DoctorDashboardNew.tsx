import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useAuthStore } from '../../store';
import socketService from '../../services/socket';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface DashboardCard {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  count?: number;
  color: string;
  screen: keyof RootStackParamList;
}

export default function DoctorDashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuthStore();
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [activePatients, setActivePatients] = useState(0);
  const [todayConsultations, setTodayConsultations] = useState(0);
  const [pendingPrescriptions, setPendingPrescriptions] = useState(0);

  useEffect(() => {
    // Load doctor stats
    loadDoctorStats();

    // Setup Socket.io connection
    if (user) {
      socketService.connect(user.id, 'doctor');
    }

    // Listen for real-time updates
    const handleQueueUpdate = (data: any) => {
      loadDoctorStats();
    };

    const handleNewAppointment = (data: any) => {
      loadDoctorStats();
    };

    socketService.on('queue_updated', handleQueueUpdate);
    socketService.on('new_appointment', handleNewAppointment);

    return () => {
      socketService.off('queue_updated', handleQueueUpdate);
      socketService.off('new_appointment', handleNewAppointment);
    };
  }, [user]);

  const loadDoctorStats = async () => {
    try {
      // TODO: Fetch from API
      setActivePatients(5);
      setTodayConsultations(12);
      setPendingPrescriptions(2);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const dashboardCards: DashboardCard[] = [
    {
      id: '1',
      title: 'Patient Queue',
      icon: 'people-outline',
      count: activePatients,
      color: '#4CAF50',
      screen: 'DoctorQueue',
    },
    {
      id: '2',
      title: 'Consultations',
      icon: 'videocam-outline',
      count: todayConsultations,
      color: '#2196F3',
      screen: 'DoctorConsultation',
    },
    {
      id: '3',
      title: 'Prescriptions',
      icon: 'document-text-outline',
      count: pendingPrescriptions,
      color: '#FF9800',
      screen: 'DoctorPrescription',
    },
    {
      id: '4',
      title: 'My Schedule',
      icon: 'calendar-outline',
      color: '#9C27B0',
      screen: 'DoctorSchedule',
    },
  ];

  const handleBreakToggle = () => {
    Alert.alert(
      isOnBreak ? 'Resume Consultations' : 'Take a Break',
      isOnBreak
        ? 'Are you ready to resume consultations?'
        : 'Do you want to take a break? Patients will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isOnBreak ? 'Resume' : 'Take Break',
          onPress: () => {
            const newStatus = !isOnBreak;
            setIsOnBreak(newStatus);
            
            // Notify server and patients via Socket.io
            if (user) {
              const status = newStatus ? 'on-break' : 'available';
              socketService.updateDoctorStatus(user.id, status);
              socketService.sendNotification(
                'patient',
                'all',
                `Dr. ${user.name} is now ${status === 'on-break' ? 'on break' : 'available'}`,
                'doctor_status'
              );
            }
            
            Alert.alert(
              'Success',
              newStatus ? 'Break mode activated' : 'You are now active'
            );
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.replace('Login' as any);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.doctorName}>Dr. {user?.name || 'Doctor'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, isOnBreak && styles.statusBannerBreak]}>
          <View style={styles.statusLeft}>
            <View
              style={[
                styles.statusIndicator,
                isOnBreak && styles.statusIndicatorBreak,
              ]}
            />
            <Text style={styles.statusText}>
              {isOnBreak ? 'On Break' : 'Available'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleBreakToggle}
            style={[styles.breakButton, isOnBreak && styles.breakButtonActive]}
          >
            <Ionicons
              name={isOnBreak ? 'play' : 'pause'}
              size={20}
              color="#FFF"
            />
            <Text style={styles.breakButtonText}>
              {isOnBreak ? 'Resume' : 'Take Break'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={28} color={Colors.primary} />
            <Text style={styles.statNumber}>{activePatients}</Text>
            <Text style={styles.statLabel}>In Queue</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            <Text style={styles.statNumber}>{todayConsultations}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={28} color="#FF9800" />
            <Text style={styles.statNumber}>~25m</Text>
            <Text style={styles.statLabel}>Avg. Time</Text>
          </View>
        </View>

        {/* Main Dashboard Cards */}
        <View style={styles.cardsGrid}>
          {dashboardCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.dashboardCard, { borderLeftColor: card.color }]}
              onPress={() => navigation.navigate(card.screen as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.cardIcon, { backgroundColor: card.color + '20' }]}>
                <Ionicons name={card.icon} size={32} color={card.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                {card.count !== undefined && (
                  <Text style={[styles.cardCount, { color: card.color }]}>
                    {card.count} {card.count === 1 ? 'item' : 'items'}
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('DoctorQueue' as any)}
            >
              <Ionicons name="person-add" size={24} color={Colors.primary} />
              <Text style={styles.quickActionText}>Next Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('DoctorSchedule' as any)}
            >
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.quickActionText}>View Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Profile' as any)}
            >
              <Ionicons name="settings" size={24} color={Colors.primary} />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greeting: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
  doctorName: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  statusBanner: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusBannerBreak: {
    backgroundColor: '#FF9800',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    marginRight: 8,
  },
  statusIndicatorBreak: {
    backgroundColor: '#FFF',
  },
  statusText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  breakButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  breakButtonText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardsGrid: {
    marginBottom: Spacing.lg,
  },
  dashboardCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
});
