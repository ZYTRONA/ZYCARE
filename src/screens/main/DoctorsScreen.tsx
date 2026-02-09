import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows, MEDICAL_SPECIALTIES } from '../../constants/theme';
import { RootStackParamList, Doctor } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Mock data
const DOCTORS: Doctor[] = [
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
    bio: 'Experienced general physician with expertise in preventive care and chronic disease management.',
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
    bio: 'Renowned cardiologist specializing in heart diseases and interventional cardiology.',
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
    bio: 'Skin care specialist with expertise in cosmetic and medical dermatology.',
  },
  {
    id: '4',
    name: 'Dr. Robert Wilson',
    email: 'robert@telemed.com',
    role: 'doctor',
    specialty: 'Pediatrician',
    qualifications: ['MBBS', 'MD Pediatrics'],
    experience: 10,
    rating: 4.8,
    consultationFee: 55,
    bio: 'Dedicated pediatrician caring for children from newborns to adolescents.',
  },
  {
    id: '5',
    name: 'Dr. Lisa Anderson',
    email: 'lisa@telemed.com',
    role: 'doctor',
    specialty: 'Psychiatrist',
    qualifications: ['MBBS', 'MD Psychiatry'],
    experience: 14,
    rating: 4.9,
    consultationFee: 90,
    bio: 'Mental health expert specializing in anxiety, depression, and mood disorders.',
  },
  {
    id: '6',
    name: 'Dr. James Taylor',
    email: 'james@telemed.com',
    role: 'doctor',
    specialty: 'Orthopedic',
    qualifications: ['MBBS', 'MS Orthopedics'],
    experience: 18,
    rating: 4.7,
    consultationFee: 75,
    bio: 'Expert in bone and joint disorders, sports injuries, and orthopedic surgery.',
  },
];

export default function DoctorsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const filteredDoctors = DOCTORS.filter((doctor) => {
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
            <Text style={styles.metaText}>${item.consultationFee}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('BookAppointment', { doctorId: item.id })}
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or specialty..."
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
            <Text style={styles.emptyStateText}>No doctors found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
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
