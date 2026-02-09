import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing } from '../constants/theme';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'Consultation'>;

const { width, height } = Dimensions.get('window');

export default function ConsultationScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    // Simulate connection delay
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (!isConnecting) {
      // Start call duration timer
      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isConnecting]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Remote Video (Doctor) */}
      <View style={styles.remoteVideoContainer}>
        <View style={styles.remoteVideoPlaceholder}>
          <Ionicons name="person" size={80} color={Colors.textWhite} />
          <Text style={styles.doctorName}>Dr. Sarah Johnson</Text>
          {isConnecting ? (
            <Text style={styles.connectionStatus}>Connecting...</Text>
          ) : (
            <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
          )}
        </View>
      </View>

      {/* Local Video (Patient) */}
      <View style={styles.localVideoContainer}>
        {isVideoOff ? (
          <View style={styles.videoOffPlaceholder}>
            <Ionicons name="videocam-off" size={32} color={Colors.textWhite} />
          </View>
        ) : (
          <View style={styles.localVideoPlaceholder}>
            <Ionicons name="person" size={40} color={Colors.textWhite} />
          </View>
        )}
      </View>

      {/* Top Controls */}
      <SafeAreaView style={styles.topControls}>
        <TouchableOpacity style={styles.topButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={Colors.textWhite} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.consultationType}>Video Consultation</Text>
          {!isConnecting && (
            <View style={styles.encryptedBadge}>
              <Ionicons name="lock-closed" size={12} color={Colors.success} />
              <Text style={styles.encryptedText}>End-to-end encrypted</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.topButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={[styles.secondaryButton, isSpeakerOn && styles.secondaryButtonActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
              size={22}
              color={Colors.textWhite}
            />
            <Text style={styles.secondaryButtonText}>
              {isSpeakerOn ? 'Speaker' : 'Muted'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="chatbubble" size={22} color={Colors.textWhite} />
            <Text style={styles.secondaryButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="people" size={22} color={Colors.textWhite} />
            <Text style={styles.secondaryButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Controls */}
        <View style={styles.primaryControls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic'}
              size={28}
              color={Colors.textWhite}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isVideoOff && styles.controlButtonActive]}
            onPress={() => setIsVideoOff(!isVideoOff)}
          >
            <Ionicons
              name={isVideoOff ? 'videocam-off' : 'videocam'}
              size={28}
              color={Colors.textWhite}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Ionicons name="call" size={32} color={Colors.textWhite} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="camera-reverse" size={28} color={Colors.textWhite} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="expand" size={28} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection Status Overlay */}
      {isConnecting && (
        <View style={styles.connectingOverlay}>
          <View style={styles.connectingContent}>
            <View style={styles.pulsingCircle}>
              <View style={styles.pulsingCircleInner}>
                <Ionicons name="call" size={32} color={Colors.textWhite} />
              </View>
            </View>
            <Text style={styles.connectingText}>Connecting to doctor...</Text>
            <Text style={styles.connectingSubtext}>Please wait</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.textPrimary,
  },
  remoteVideoContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textWhite,
    marginTop: Spacing.lg,
  },
  connectionStatus: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
  callDuration: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.textWhite,
    marginTop: Spacing.sm,
  },
  localVideoContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  localVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffPlaceholder: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCenter: {
    alignItems: 'center',
  },
  consultationType: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  encryptedText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.success,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xxxl,
    marginBottom: Spacing.xl,
  },
  secondaryButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  secondaryButtonActive: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textWhite,
    marginTop: Spacing.xs,
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '135deg' }],
  },
  connectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingContent: {
    alignItems: 'center',
  },
  pulsingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(74, 144, 217, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingCircleInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
    marginTop: Spacing.xl,
  },
  connectingSubtext: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
});
