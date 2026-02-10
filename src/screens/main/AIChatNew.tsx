import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Mic, Send, Volume2, Bot, AlertCircle, StopCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useChatStore, useAuthStore } from '../../store';
import { Colors } from '../../constants/theme';

const AI_ENGINE_URL = 'http://10.56.198.1:8000';

interface NavigationProp {
  navigate: (screen: string) => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  severity?: string;
  recommended_action?: string;
}

export default function AIChat({ navigation }: { navigation: NavigationProp }) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [severity, setSeverity] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const user = useAuthStore((state) => state.user);
  const scrollViewRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Microphone Permission',
            'Please enable microphone access to use voice input'
          );
        }
      } catch (error) {
        console.error('Error requesting audio permissions:', error);
      }
    })();

    return () => {
      Speech.stop();
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...');
      Alert.alert('Debug', 'startRecording called');
      
      // Request permissions first
      const { status } = await Audio.requestPermissionsAsync();
      console.log('📋 Permission status:', status);
      Alert.alert('Permission Status', `Status: ${status}`);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone access is required to record audio. Please enable it in settings.'
        );
        return;
      }

      // Set audio mode for recording
      console.log('🔧 Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('✅ Audio mode set');

      console.log('🎙️ Creating recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      console.log('✅ Recording created:', newRecording);
      
      setRecording(newRecording);
      setIsRecording(true);
      console.log('✅ Recording started successfully');
      Alert.alert('Recording Started', '🔴 Recording your voice now! Tap again to stop.');
    } catch (error: any) {
      console.error('❌ Failed to start recording:', error);
      Alert.alert(
        'Recording Error',
        `Unable to start recording: ${error.message || JSON.stringify(error)}`
      );
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      console.log('⚠️ No recording to stop');
      Alert.alert('No Recording', 'No active recording found');
      return;
    }

    try {
      console.log('⏹️ Stopping recording...');
      Alert.alert('Processing', 'Stopping recording and preparing to transcribe...');
      
      setIsRecording(false);
      setIsProcessing(true);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('✅ Recording stopped, URI:', uri);

      // Send audio to AI engine for transcription
      if (uri) {
        Alert.alert('Transcribing', 'Sending audio to AI for transcription...');
        await transcribeAudio(uri);
      } else {
        console.error('❌ No URI received from recording');
        Alert.alert('Recording Error', 'Failed to save recording. Please try again.');
      }

      setRecording(null);
    } catch (error: any) {
      console.error('❌ Failed to stop recording:', error);
      Alert.alert(
        'Recording Error',
        `Unable to process recording: ${error.message || 'Unknown error'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const transcribeAudio = async (audioUri: string) => {
    try {
      console.log('🔄 Transcribing audio from:', audioUri);
      
      // Create FormData with proper file object
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      console.log('📤 Sending to:', `${AI_ENGINE_URL}/transcribe`);

      const response = await fetch(`${AI_ENGINE_URL}/transcribe`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let the browser/fetch set it automatically with boundary
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Transcription failed:', errorText);
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Transcription result:', data);

      if (!data.text || data.text.trim() === '') {
        Alert.alert(
          'No Speech Detected',
          'Could not detect any speech in the recording. Please try again.'
        );
        return;
      }

      // Set the transcribed text and send message
      setInputText(data.text);
      
      // Auto-send the transcribed message
      setTimeout(() => {
        handleSendMessage(data.text);
      }, 500);
    } catch (error: any) {
      console.error('❌ Transcription error:', error);
      Alert.alert(
        'Transcription Failed',
        `Unable to transcribe audio: ${error.message || 'Unknown error'}. Please type your message or try again.`
      );
    }
  };

  const handleVoiceInput = () => {
    if (isRecording) {
      console.log('🛑 User stopped recording');
      stopRecording();
    } else {
      console.log('🎤 User started recording');
      startRecording();
    }
  };

  const speakText = async (text: string) => {
    try {
      // Stop any ongoing speech
      await Speech.stop();
      
      setIsSpeaking(true);

      // Speak the text
      Speech.speak(text, {
        language: 'en-IN', // Indian English
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputText;
    
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputText('');

    try {
      // Call AI engine chat endpoint
      const chatResponse = await fetch(`${AI_ENGINE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-5).map((m: Message) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (!chatResponse.ok) {
        throw new Error('AI chat failed');
      }

      const chatData = await chatResponse.json();

      // Also analyze for severity
      const analysisResponse = await fetch(`${AI_ENGINE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: messageText }),
      });

      let analysis = null;
      if (analysisResponse.ok) {
        analysis = await analysisResponse.json();
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: chatData.reply,
        sender: 'ai',
        timestamp: new Date(),
        severity: analysis?.severity,
        recommended_action: analysis?.recommended_action,
      };

      addMessage(aiMessage);
      
      if (analysis?.severity) {
        setSeverity(analysis.severity);
      }

      // Auto-speak AI response
      speakText(chatData.reply);

      // Create ticket in backend
      if (user?.userId) {
        try {
          // TODO: Implement ticket creation when ticketAPI is available
          console.log('Ticket creation skipped - API not available');
        } catch (ticketError) {
          console.error('Failed to create ticket:', ticketError);
        }
      }

      if (analysis?.severity === 'HIGH') {
        setTimeout(() => {
          Alert.alert(
            'High Priority',
            'Your symptoms require immediate medical attention. Would you like to connect with a doctor?',
            [
              { text: 'Not Now', style: 'cancel' },
              {
                text: 'Connect Doctor',
                onPress: () => navigation.navigate('Doctors'),
              },
            ]
          );
        }, 1000);
      }
    } catch (error) {
      console.error('❌ AI Chat Error:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please check your internet connection and try again.',
        sender: 'ai',
        timestamp: new Date(),
      });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowEnd : styles.messageRowStart]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Bot size={18} color="#8B5CF6" />
          </View>
        )}
        <View style={styles.messageContent}>
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.messageBubbleUser : styles.messageBubbleAI,
              !isUser && styles.messageShadow,
            ]}
          >
            <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAI]}>
              {item.text}
            </Text>
            {item.severity && (
              <View
                style={[
                  styles.severityBadge,
                  item.severity === 'HIGH'
                    ? styles.severityHigh
                    : item.severity === 'MEDIUM'
                    ? styles.severityMedium
                    : styles.severityLow,
                ]}
              >
                <Text style={styles.severityText}>
                  {item.severity} PRIORITY
                </Text>
              </View>
            )}
            {item.recommended_action && (
              <Text style={styles.recommendationText}>
                💡 {item.recommended_action}
              </Text>
            )}
          </View>
          
          {!isUser && (
            <TouchableOpacity
              style={styles.speakButton}
              onPress={() => isSpeaking ? stopSpeaking() : speakText(item.text)}
            >
              {isSpeaking ? (
                <StopCircle size={16} color="#8B5CF6" />
              ) : (
                <Volume2 size={16} color="#8B5CF6" />
              )}
              <Text style={styles.speakButtonText}>
                {isSpeaking ? 'Stop' : 'Listen'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <Bot size={28} color="white" strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Health Assistant</Text>
              <Text style={styles.headerSubtitle}>
                {isRecording 
                  ? '🔴 Recording... (Tap again to stop)' 
                  : isSpeaking 
                  ? '🔊 Speaking...' 
                  : isProcessing
                  ? '⚙️ Processing audio...'
                  : 'Tap 🎤 to speak'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        ref={scrollViewRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Bot size={48} color="#8B5CF6" strokeWidth={1.5} />
            </View>
            <Text style={styles.emptyTitle}>
              Welcome to AI Health Assistant
            </Text>
            <Text style={styles.emptyDescription}>
              Describe your symptoms and I'll help analyze them
            </Text>
            <Text style={styles.emptyHint}>
              💡 Tap the microphone to speak or type your message
            </Text>
          </View>
        }
      />

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator color="#8B5CF6" />
          <Text style={styles.processingText}>Processing audio...</Text>
        </View>
      )}

      {severity === 'HIGH' && (
        <View style={styles.alertContainer}>
          <TouchableOpacity
            style={styles.alertButton}
            onPress={() => navigation.navigate('Doctors')}
          >
            <AlertCircle size={20} color="white" />
            <Text style={styles.alertButtonText}>
              Connect with Doctor Now
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={[
              styles.micButton,
              isRecording ? styles.micButtonRecording : styles.micButtonIdle,
            ]}
            onPress={handleVoiceInput}
            disabled={isProcessing}
          >
            {isRecording ? (
              <StopCircle size={24} color="#DC2626" />
            ) : (
              <Mic size={24} color="#8B5CF6" />
            )}
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder={isRecording ? 'Recording...' : 'Type or speak your symptoms...'}
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isRecording && !isProcessing}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: inputText.trim() && !isRecording && !isProcessing ? 1 : 0.5 },
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isRecording || isProcessing}
          >
            <Send size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {!isRecording && (
          <View>
            <Text style={styles.hintText}>
              🎤 Tap microphone to record • AI will speak responses automatically
            </Text>
            <Text style={styles.hintTextSmall}>
              Note: First time may ask for microphone permission
            </Text>
          </View>
        )}
        {isRecording && (
          <Text style={styles.recordingHint}>
            🔴 RECORDING... Tap mic again to stop
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  messageRowStart: {
    justifyContent: 'flex-start',
  },
  messageRowEnd: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageContent: {
    flex: 1,
    maxWidth: '85%',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubbleUser: {
    backgroundColor: '#0088CC',
    alignSelf: 'flex-end',
  },
  messageBubbleAI: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  messageShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
  },
  messageTextUser: {
    color: 'white',
  },
  messageTextAI: {
    color: '#1F2937',
  },
  severityBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  severityHigh: {
    backgroundColor: '#EF4444',
  },
  severityMedium: {
    backgroundColor: '#F59E0B',
  },
  severityLow: {
    backgroundColor: '#10B981',
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationText: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  speakButton: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  speakButtonText: {
    color: '#8B5CF6',
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    backgroundColor: '#F3E8FF',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  emptyHint: {
    color: '#8B5CF6',
    textAlign: 'center',
    paddingHorizontal: 32,
    fontSize: 14,
  },
  processingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    color: '#8B5CF6',
    marginLeft: 8,
  },
  alertContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  alertButton: {
    backgroundColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micButton: {
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonIdle: {
    backgroundColor: '#F3E8FF',
    borderWidth: 0,
  },
  micButtonRecording: {
    backgroundColor: '#FEE2E2',
    borderWidth: 3,
    borderColor: '#DC2626',
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 96,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: '#8B5CF6',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  hintTextSmall: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  recordingHint: {
    color: '#DC2626',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});