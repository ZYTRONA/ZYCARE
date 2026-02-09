import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { RootStackParamList, ChatMessage } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ChatScreen'>;

// Mock messages
const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    senderId: 'doctor',
    senderName: 'Dr. Sarah Johnson',
    senderRole: 'doctor',
    message: 'Hello! I can see you have some symptoms you would like to discuss. How can I help you today?',
    timestamp: '10:00 AM',
    type: 'text',
  },
  {
    id: '2',
    senderId: 'patient',
    senderName: 'John Doe',
    senderRole: 'patient',
    message: 'Hi Doctor, I have been experiencing headaches for the past 3 days along with mild fever.',
    timestamp: '10:02 AM',
    type: 'text',
  },
  {
    id: '3',
    senderId: 'doctor',
    senderName: 'Dr. Sarah Johnson',
    senderRole: 'doctor',
    message: 'I understand. Can you tell me more about the headache? Is it constant or does it come and go? Which part of your head hurts the most?',
    timestamp: '10:03 AM',
    type: 'text',
  },
  {
    id: '4',
    senderId: 'patient',
    senderName: 'John Doe',
    senderRole: 'patient',
    message: 'It is mostly on the front part of my head, and it comes and goes. The pain increases when I look at screens.',
    timestamp: '10:05 AM',
    type: 'text',
  },
  {
    id: '5',
    senderId: 'doctor',
    senderName: 'Dr. Sarah Johnson',
    senderRole: 'doctor',
    message: 'Based on your symptoms, this could be a tension headache or possibly eye strain related. I would recommend taking some rest and avoiding screens for a while. Let me prescribe some medication for you.',
    timestamp: '10:07 AM',
    type: 'text',
  },
];

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'patient',
      senderName: 'John Doe',
      senderRole: 'patient',
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    // Simulate doctor typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const doctorReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'doctor',
        senderName: 'Dr. Sarah Johnson',
        senderRole: 'doctor',
        message: 'Thank you for the information. I will review this and get back to you shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setMessages((prev) => [...prev, doctorReply]);
    }, 2000);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isPatient = item.senderRole === 'patient';
    const isAI = item.senderRole === 'ai';

    return (
      <View
        style={[
          styles.messageContainer,
          isPatient ? styles.messageContainerRight : styles.messageContainerLeft,
        ]}
      >
        {!isPatient && (
          <View style={[styles.avatarSmall, isAI && styles.avatarAI]}>
            <Ionicons
              name={isAI ? 'sparkles' : 'person'}
              size={16}
              color={isAI ? Colors.accent : Colors.primary}
            />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isPatient ? styles.messageBubbleRight : styles.messageBubbleLeft,
            isAI && styles.messageBubbleAI,
          ]}
        >
          {!isPatient && (
            <Text style={[styles.senderName, isAI && styles.senderNameAI]}>
              {isAI ? 'AI Assistant' : item.senderName}
            </Text>
          )}
          <Text
            style={[
              styles.messageText,
              isPatient && styles.messageTextRight,
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isPatient && styles.messageTimeRight,
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color={Colors.primary} />
            </View>
            <View style={styles.onlineIndicator} />
          </View>
          <View>
            <Text style={styles.doctorName}>{route.params?.doctorName || 'Dr. Sarah Johnson'}</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="call" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="videocam" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <View style={styles.typingBubble}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, { opacity: 0.4 }]} />
              <View style={[styles.typingDot, { opacity: 0.6 }]} />
              <View style={[styles.typingDot, { opacity: 0.8 }]} />
            </View>
            <Text style={styles.typingText}>Dr. Sarah is typing...</Text>
          </View>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="attach" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor={Colors.textLight}
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputMessage.trim() && styles.sendButtonActive,
            ]}
            onPress={sendMessage}
            disabled={!inputMessage.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputMessage.trim() ? Colors.textWhite : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
          <Text style={styles.quickActionText}>Share Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="image-outline" size={18} color={Colors.primary} />
          <Text style={styles.quickActionText}>Send Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Ionicons name="medical-outline" size={18} color={Colors.primary} />
          <Text style={styles.quickActionText}>Symptoms</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  doctorName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
  },
  onlineStatus: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.success,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  messageContainerLeft: {
    justifyContent: 'flex-start',
  },
  messageContainerRight: {
    justifyContent: 'flex-end',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarAI: {
    backgroundColor: Colors.accent + '30',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: 16,
  },
  messageBubbleLeft: {
    backgroundColor: Colors.cardBackground,
    borderBottomLeftRadius: 4,
    ...Shadows.small,
  },
  messageBubbleRight: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: Colors.accent + '15',
    borderWidth: 1,
    borderColor: Colors.accent + '30',
  },
  senderName: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  senderNameAI: {
    color: Colors.accent,
  },
  messageText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  messageTextRight: {
    color: Colors.textWhite,
  },
  messageTime: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  messageTimeRight: {
    color: 'rgba(255,255,255,0.7)',
  },
  typingContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    alignSelf: 'flex-start',
    ...Shadows.small,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    marginRight: Spacing.sm,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
  },
  typingText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginHorizontal: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
  },
  emojiButton: {
    padding: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.disabled,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: 20,
  },
  quickActionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
});
