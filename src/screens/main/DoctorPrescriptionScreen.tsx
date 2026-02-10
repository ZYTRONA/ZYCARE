import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import socketService from '../../services/socket';
import { useAuthStore } from '../../store';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionData {
  patientName: string;
  age: number;
  gender: string;
  diagnosis: string;
  medicines: Medicine[];
  notes: string;
  followUp: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DoctorPrescription'>;
type PrescriptionRouteProp = RouteProp<RootStackParamList, 'DoctorPrescription'>;

export default function DoctorPrescriptionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PrescriptionRouteProp>();
  const { user } = useAuthStore();
  
  const { patientId, patientName, patientData } = route.params || {};
  
  // Display patient info from route params
  const displayPatientName = patientName || 'Unknown Patient';
  const displayAge = patientData?.age || 0;
  const displayGender = patientData?.gender || 'Unknown';

  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [currentMedicine, setCurrentMedicine] = useState<Partial<Medicine>>({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });
  const [notes, setNotes] = useState('');
  const [followUp, setFollowUp] = useState('');

  const commonMedicines = [
    'Paracetamol 500mg',
    'Ibuprofen 400mg',
    'Amoxicillin 500mg',
    'Azithromycin 500mg',
    'Cetirizine 10mg',
    'Omeprazole 20mg',
  ];

  const dosageOptions = ['250mg', '500mg', '1000mg', '1 tablet', '2 tablets'];
  const frequencyOptions = ['Once daily', 'Twice daily', 'Thrice daily', 'As needed'];
  const durationOptions = ['3 days', '5 days', '7 days', '10 days', '15 days'];

  const addMedicine = () => {
    if (!currentMedicine.name) {
      Alert.alert('Error', 'Please enter medicine name');
      return;
    }
    if (!currentMedicine.dosage) {
      Alert.alert('Error', 'Please select dosage');
      return;
    }

    const newMedicine: Medicine = {
      id: Date.now().toString(),
      name: currentMedicine.name || '',
      dosage: currentMedicine.dosage || '',
      frequency: currentMedicine.frequency || 'Twice daily',
      duration: currentMedicine.duration || '5 days',
      instructions: currentMedicine.instructions || 'Take after food',
    };

    setMedicines([...medicines, newMedicine]);
    setCurrentMedicine({
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const generatePDF = async () => {
    if (!diagnosis) {
      Alert.alert('Error', 'Please enter diagnosis');
      return;
    }
    if (medicines.length === 0) {
      Alert.alert('Error', 'Please add at least one medicine');
      return;
    }

    Alert.alert(
      'Generate Prescription',
      'Generate and send prescription to patient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate PDF',
          onPress: async () => {
            try {
              // TODO: Call API to generate PDF
              const prescriptionData: PrescriptionData = {
                patientName: displayPatientName,
                age: displayAge,
                gender: displayGender,
                diagnosis,
                medicines,
                notes,
                followUp,
              };

              console.log('Generating PDF with data:', prescriptionData);
              
              // Send Socket.io notification
              if (patientId) {
                socketService.createPrescription({
                  patientId,
                  doctorId: user?.id,
                  doctorName: user?.name,
                  prescriptionData,
                  timestamp: new Date().toISOString(),
                });
              }
              
              Alert.alert(
                'Success',
                'Prescription generated and sent to patient!',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to generate prescription');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Prescription</Text>
        <TouchableOpacity onPress={generatePDF} style={styles.saveButton}>
          <Ionicons name="download-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Info */}
        <View style={styles.patientInfoCard}>
          <View style={styles.patientInfoHeader}>
            <Ionicons name="person-circle-outline" size={48} color={Colors.primary} />
            <View style={styles.patientInfoText}>
              <Text style={styles.patientName}>{displayPatientName}</Text>
              <Text style={styles.patientMeta}>
                {displayAge} years • {displayGender}
              </Text>
              {patientData?.symptoms && (
                <Text style={styles.patientSymptoms} numberOfLines={2}>
                  <Ionicons name="medical" size={12} /> {patientData.symptoms}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnosis *</Text>
          <TextInput
            style={styles.textArea}
            value={diagnosis}
            onChangeText={setDiagnosis}
            placeholder="Enter diagnosis..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Add Medicine */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Medicine</Text>
          
          <View style={styles.medicineForm}>
            <Text style={styles.label}>Medicine Name *</Text>
            <TextInput
              style={styles.input}
              value={currentMedicine.name}
              onChangeText={(text) =>
                setCurrentMedicine({ ...currentMedicine, name: text })
              }
              placeholder="Enter medicine name"
            />

            <Text style={styles.label}>Quick Select</Text>
            <View style={styles.chipContainer}>
              {commonMedicines.map((med) => (
                <TouchableOpacity
                  key={med}
                  style={styles.chip}
                  onPress={() =>
                    setCurrentMedicine({ ...currentMedicine, name: med })
                  }
                >
                  <Text style={styles.chipText}>{med}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Dosage *</Text>
            <View style={styles.chipContainer}>
              {dosageOptions.map((dosage) => (
                <TouchableOpacity
                  key={dosage}
                  style={[
                    styles.chip,
                    currentMedicine.dosage === dosage && styles.chipSelected,
                  ]}
                  onPress={() =>
                    setCurrentMedicine({ ...currentMedicine, dosage })
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      currentMedicine.dosage === dosage && styles.chipTextSelected,
                    ]}
                  >
                    {dosage}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.chipContainer}>
              {frequencyOptions.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.chip,
                    currentMedicine.frequency === freq && styles.chipSelected,
                  ]}
                  onPress={() =>
                    setCurrentMedicine({ ...currentMedicine, frequency: freq })
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      currentMedicine.frequency === freq && styles.chipTextSelected,
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Duration</Text>
            <View style={styles.chipContainer}>
              {durationOptions.map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[
                    styles.chip,
                    currentMedicine.duration === dur && styles.chipSelected,
                  ]}
                  onPress={() =>
                    setCurrentMedicine({ ...currentMedicine, duration: dur })
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      currentMedicine.duration === dur && styles.chipTextSelected,
                    ]}
                  >
                    {dur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={styles.input}
              value={currentMedicine.instructions}
              onChangeText={(text) =>
                setCurrentMedicine({ ...currentMedicine, instructions: text })
              }
              placeholder="e.g., Take after food"
            />

            <TouchableOpacity style={styles.addButton} onPress={addMedicine}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add Medicine</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Medicine List */}
        {medicines.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescribed Medicines</Text>
            {medicines.map((medicine) => (
              <View key={medicine.id} style={styles.medicineCard}>
                <View style={styles.medicineHeader}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  <TouchableOpacity onPress={() => removeMedicine(medicine.id)}>
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.medicineDetail}>
                  <Ionicons name="medical" size={14} /> Dosage: {medicine.dosage}
                </Text>
                <Text style={styles.medicineDetail}>
                  <Ionicons name="time" size={14} /> {medicine.frequency} for{' '}
                  {medicine.duration}
                </Text>
                <Text style={styles.medicineDetail}>
                  <Ionicons name="information-circle" size={14} />{' '}
                  {medicine.instructions}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional instructions for the patient..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Follow Up */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up</Text>
          <TextInput
            style={styles.input}
            value={followUp}
            onChangeText={setFollowUp}
            placeholder="e.g., After 7 days"
          />
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generatePDF}
        >
          <Ionicons name="document-text" size={24} color="#FFF" />
          <Text style={styles.generateButtonText}>Generate & Send Prescription</Text>
        </TouchableOpacity>

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
  saveButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  patientInfoCard: {
    backgroundColor: '#FFF',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  patientInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientInfoText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  patientMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  patientSymptoms: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#FFF',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  medicineForm: {
    marginTop: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  chip: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: '#666',
  },
  chipTextSelected: {
    color: '#FFF',
  },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  medicineCard: {
    backgroundColor: '#F9F9F9',
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  medicineDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
