import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows, MEDICAL_SPECIALTIES } from '../../constants/theme';
import { RootStackParamList, Doctor } from '../../types';
import { doctorsAPI } from '../../services/api';
import { useLanguageStore } from '../../store';
import { t, LanguageCode } from '../../languages';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DoctorsScreenRouteProp = RouteProp<RootStackParamList, 'Doctors'>;

export default function DoctorsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DoctorsScreenRouteProp>();
  const language = useLanguageStore((state: any) => state.language) as LanguageCode;
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('📡 Fetching doctors from API...');
        const response = await doctorsAPI.getAll();
        console.log('✅ Doctors fetched:', response);
        
        // Handle both array and object response
        const doctorsList = Array.isArray(response) ? response : response.data || response.doctors || [];
        setDoctors(doctorsList);
      } catch (err: any) {
        console.error('❌ Error fetching doctors:', err);
        // Silently fail and use fallback - the API will have already tried fallback
        // Only set error state if truly critical
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Set initial specialty filter from navigation params
  useEffect(() => {
    if (route.params?.filterSpecialty) {
      setSelectedSpecialty(route.params.filterSpecialty);
    }
  }, [route.params?.filterSpecialty]);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const renderSpecialty = ({ item }: { item: string }) => {
    const isSelected = selectedSpecialty === item;
    return (
      <TouchableOpacity
        style={[styles.specialtyChip, isSelected && styles.specialtyChipActive]}
        onPress={() => setSelectedSpecialty(isSelected ? null : item)}
      >
        <Text style={[styles.specialtyChipText, isSelected && styles.specialtyChipTextActive]}>
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => navigation.navigate('DoctorProfile', { doctorId: item.id })}
    >
      <View style={styles.doctorAvatar}>
        <Ionicons name="person" size={36} color={Colors.primary} />
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
        <Text style={styles.doctorQualifications}>
          {item.qualifications.join(', ')}
        </Text>
        <View style={styles.doctorMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.metaText}>{item.rating}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.experience} yrs</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>₹{item.consultationFee}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('BookAppointment', { doctor: item })}
      >
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Doctors</Text>
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading doctors...</Text>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t(language, 'home.searchPlaceholder', 'Search doctors, symptoms...')}
              placeholderTextColor={Colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Specialty Filter */}
          <FlatList
            horizontal
            data={MEDICAL_SPECIALTIES}
            renderItem={renderSpecialty}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialtyList}
            style={styles.specialtyContainer}
          />

          {/* Doctors List */}
          <FlatList
            data={filteredDoctors}
            renderItem={renderDoctor}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.doctorsList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="medical-outline" size={64} color={Colors.textLight} />
                <Text style={styles.emptyStateText}>{t(language, 'doctors.noDoctorsFound', 'No doctors found')}</Text>
                <Text style={styles.emptyStateSubtext}>
                  {t(language, 'doctors.adjustSearch', 'Try adjusting your search or filters')}
                </Text>
              </View>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
  },
  specialtyContainer: {
    maxHeight: 50,
    marginTop: Spacing.md,
  },
  specialtyList: {
    paddingHorizontal: Spacing.lg,
  },
  specialtyChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    marginHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  specialtyChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  specialtyChipText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  specialtyChipTextActive: {
    color: Colors.textWhite,
  },
  doctorsList: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  doctorCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  doctorAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  doctorName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  doctorQualifications: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  doctorMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: Spacing.xs,
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignSelf: 'center',
  },
  bookButtonText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
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
  },
});
