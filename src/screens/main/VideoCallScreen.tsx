import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors } from '../../constants/theme';
import socketService from '../../services/socket';
import { useAuthStore } from '../../store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoCall'>;
type VideoCallRouteProp = RouteProp<RootStackParamList, 'VideoCall'>;

export default function VideoCall() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<VideoCallRouteProp>();
  const { user } = useAuthStore();
  
  const { patientId, patientName, patientData } = route.params || {};
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Start consultation event
    if (user && patientId) {
      socketService.startConsultation(user.id, patientId);
    }

    // Call duration timer
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      // End consultation event when leaving
      if (user && patientId) {
        socketService.endConsultation(user.id, patientId);
      }
    };
  }, [user, patientId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            // Navigate to prescription screen with patient data
            if (user?.role === 'doctor' && patientId) {
              navigation.navigate('DoctorPrescription', {
                patientId,
                patientName,
                patientData,
              });
            } else {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
      {/* Video Container */}
      <View style={styles.videoContainer}>
        {/* Placeholder for Video SDK Integration */}
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam" size={64} color="#FFF" />
          <Text style={styles.videoText}>Video Call Active</Text>
          <Text style={styles.patientName}>{patientName || 'Patient'}</Text>
          <Text style={styles.integrationNote}>
            Integrate ZegoCloud or Twilio SDK here
          </Text>
        </View>
      </View>

      {/* AI Summary Overlay */}
      {patientData?.symptoms && (
        <View style={styles.aiSummaryOverlay}>
          <Text style={styles.aiSummaryTitle}>
            <Ionicons name="sparkles" size={14} color="#FFF" /> AI Summary
          </Text>
          <Text style={styles.aiSummaryText}>
            {patientData.symptoms}
          </Text>
          {patientData.age && (
            <Text style={styles.aiSummaryDetail}>
              Age: {patientData.age} • {patientData.gender}
            </Text>
          )}
        </View>
      )}

      {/* Call Duration */}
      <View style={styles.durationContainer}>
        <Ionicons name="time-outline" size={16} color="#FFF" />
        <Text style={styles.durationText}>{formatDuration(callDuration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Mute Button */}
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>

        {/* End Call Button */}
        <TouchableOpacity
          style={styles.endCallButton}
          onPress={handleEndCall}
        >
          <Ionicons name="call" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Video Toggle Button */}
        <TouchableOpacity
          style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
          onPress={() => setIsVideoOff(!isVideoOff)}
        >
          <Ionicons
            name={isVideoOff ? 'videocam-off' : 'videocam'}
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      {user?.role === 'doctor' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Navigate to prescription while keeping call active
              navigation.navigate('DoctorPrescription', {
                patientId,
                patientName,
                patientData,
              });
            }}
          >
            <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Prescription</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  patientName: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 8,
  },
  integrationNote: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 16,
    paddingHorizontal: 32,
    textAlign: 'center',
  },
  aiSummaryOverlay: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    borderRadius: 16,
    padding: 16,
    maxWidth: '60%',
  },
  aiSummaryTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  aiSummaryText: {
    color: '#FFF',
    fontSize: 13,
    lineHeight: 18,
  },
  aiSummaryDetail: {
    color: '#E0E7FF',
    fontSize: 11,
    marginTop: 6,
  },
  durationContainer: {
    position: 'absolute',
    top: 80,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    color: '#FFF',
    fontFamily: 'monospace',
    fontSize: 14,
    marginLeft: 6,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  controlButtonActive: {
    backgroundColor: '#EF4444',
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
});
