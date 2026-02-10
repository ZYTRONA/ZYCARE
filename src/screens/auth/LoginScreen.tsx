import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, Typography, Spacing, Shadows } from '../../constants/theme';
import { RootStackParamList } from '../../types';
import { useAuthStore, useLanguageStore } from '../../store';
import { authAPI } from '../../services/api';
import { t, LanguageCode, languages } from '../../languages';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const login = useAuthStore((state: any) => state.login);
  const language = useLanguageStore((state: any) => state.language);
  const setLanguage = useLanguageStore((state: any) => state.setLanguage);
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobileNumber = (mobile: string) => {
    const mobileRegex = /^[0-9]{10}$/; // 10 digit Indian mobile number
    return mobileRegex.test(mobile);
  };

  const handleLanguageSelect = useCallback((lang: LanguageCode) => {
    setLanguage(lang);
  }, [setLanguage]);

  const handleRoleSelect = useCallback((selectedRole: 'patient' | 'doctor') => {
    setRole(selectedRole);
  }, []);

  const handleSendOTP = async () => {
    if (!email || !name || !mobileNumber) {
      Alert.alert(t(language as LanguageCode, 'common.error'), t(language as LanguageCode, 'auth.enterAllFields', 'Please enter email, name, and mobile number'));
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(t(language as LanguageCode, 'common.error'), t(language as LanguageCode, 'auth.invalidEmail', 'Please enter a valid email address (e.g., user@example.com)'));
      return;
    }

    if (!validateMobileNumber(mobileNumber)) {
      Alert.alert(t(language as LanguageCode, 'common.error'), t(language as LanguageCode, 'auth.invalidMobile', 'Please enter a valid 10-digit mobile number'));
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Sending OTP to:', email);
      
      // Send OTP via backend API
      const response = await authAPI.login(email, name, role);
      console.log('OTP Response:', response);
      
      if (response.success) {
        setOtpSent(true);
        Alert.alert(
          t(language as LanguageCode, 'auth.otpSentSuccess', 'OTP Sent Successfully'), 
          t(language as LanguageCode, 'auth.otpSentMessage', `A 6-digit OTP has been sent to:\n${email}\n\nCheck your email inbox.`),
          [{ text: t(language as LanguageCode, 'common.ok', 'OK'), style: 'default' }]
        );
      } else {
        Alert.alert(t(language as LanguageCode, 'common.error'), response.message || t(language as LanguageCode, 'auth.otpSendFailed', 'Failed to send OTP'));
      }
    } catch (error: any) {
      console.error('OTP Send Error:', error);
      Alert.alert(t(language as LanguageCode, 'common.error'), t(language as LanguageCode, 'auth.otpSendError', 'Failed to send OTP. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert(t(language as LanguageCode, 'common.error'), t(language as LanguageCode, 'auth.enterOTP', 'Please enter OTP'));
      return;
    }

    if (otp.length !== 6) {
      Alert.alert(t(language as LanguageCode, 'common.error'), t(language as LanguageCode, 'auth.otpLength', 'OTP must be 6 digits'));
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🔐 Verifying OTP:', otp, 'for email:', email);
      const response = await authAPI.verifyOTP(email, otp);
      console.log('✅ Verify Response:', response);
      
      if (response.success && response.user) {
        // Merge the phone number from login form with user data
        const userWithPhone = {
          ...response.user,
          phone: mobileNumber,
          name: name || response.user.name,
        };
        login(userWithPhone);
        Alert.alert(t(language as LanguageCode, 'common.success'), t(language as LanguageCode, 'auth.loginSuccess', 'Login successful!'));
        // Navigation happens automatically when isAuthenticated state changes
      } else {
        Alert.alert(t(language as LanguageCode, 'common.error'), response.message || t(language as LanguageCode, 'auth.invalidOTP', 'Invalid OTP'));
      }
    } catch (error: any) {
      console.error('❌ OTP Verify Error:', error);
      Alert.alert(
        t(language as LanguageCode, 'common.error'), 
        error.message || t(language as LanguageCode, 'auth.invalidOTP', 'Invalid OTP. Please check and try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="medical" size={60} color={Colors.primary} />
            </View>
            <Text style={styles.title}>ZYCARE</Text>
            <Text style={styles.subtitle}>
              {t(language as LanguageCode, 'auth.subtitle', 'Your AI-powered health companion')}
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>{t(language as LanguageCode, 'auth.welcomeTitle', 'Welcome to ZYCARE')}</Text>
            <Text style={styles.formSubtitle}>
              {otpSent ? t(language as LanguageCode, 'auth.checkEmail', 'Check your email for a 6-digit OTP') : t(language as LanguageCode, 'auth.enterDetails', 'Enter your details to continue')}
            </Text>

            {!otpSent ? (
              <>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t(language as LanguageCode, 'auth.email', 'Email Address')}
                    placeholderTextColor={Colors.textLight}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t(language as LanguageCode, 'auth.name', 'Full Name')}
                    placeholderTextColor={Colors.textLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Mobile Number Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t(language as LanguageCode, 'auth.mobileNumber', 'Mobile Number (10 digits)')}
                    placeholderTextColor={Colors.textLight}
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                {/* Language Selection */}
                <View style={styles.languageContainer}>
                  <Text style={styles.languageLabel}>{t(language as LanguageCode, 'auth.selectLanguage', 'Select Language:')}</Text>
                  <View style={styles.languageButtons}>
                    <TouchableOpacity
                      style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
                      onPress={() => handleLanguageSelect('en')}
                    >
                      <Text style={[styles.languageText, language === 'en' && styles.languageTextActive]}>
                        English
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.languageButton, language === 'ta' && styles.languageButtonActive]}
                      onPress={() => handleLanguageSelect('ta')}
                    >
                      <Text style={[styles.languageText, language === 'ta' && styles.languageTextActive]}>
                        தமிழ்
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.languageButton, language === 'hi' && styles.languageButtonActive]}
                      onPress={() => handleLanguageSelect('hi')}
                    >
                      <Text style={[styles.languageText, language === 'hi' && styles.languageTextActive]}>
                        हिंदी
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Role Selection */}
                <View style={styles.roleContainer}>
                  <Text style={styles.roleLabel}>{t(language as LanguageCode, 'auth.loginAs', 'Login as:')}</Text>
                  <View style={styles.roleButtons}>
                    <TouchableOpacity
                      style={[styles.roleButton, role === 'patient' && styles.roleButtonActive]}
                      onPress={() => handleRoleSelect('patient')}
                    >
                      <Ionicons 
                        name="person" 
                        size={20} 
                        color={role === 'patient' ? Colors.textWhite : Colors.primary}
                      />
                      <Text style={[styles.roleText, role === 'patient' && styles.roleTextActive]}>
                        {t(language as LanguageCode, 'auth.patient', 'Patient')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, role === 'doctor' && styles.roleButtonActive]}
                      onPress={() => handleRoleSelect('doctor')}
                    >
                      <Ionicons 
                        name="medical" 
                        size={20} 
                        color={role === 'doctor' ? Colors.textWhite : Colors.primary}
                      />
                      <Text style={[styles.roleText, role === 'doctor' && styles.roleTextActive]}>
                        {t(language as LanguageCode, 'auth.doctor', 'Doctor')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleSendOTP}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? t(language as LanguageCode, 'auth.sendingOTP', 'Sending OTP...') : t(language as LanguageCode, 'auth.sendOTP', 'Send OTP')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* OTP Input */}
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key-outline"
                    size={20}
                    color={Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder={t(language as LanguageCode, 'auth.enterOTP', 'Enter 6-digit OTP')}
                    placeholderTextColor={Colors.textLight}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleVerifyOTP}
                  disabled={isLoading}
                >
                  <Text style={styles.loginButtonText}>
                    {isLoading ? t(language as LanguageCode, 'auth.verifying', 'Verifying...') : t(language as LanguageCode, 'auth.verifyOTP', 'Verify OTP')}
                  </Text>
                </TouchableOpacity>

                {/* Resend OTP */}
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={async () => {
                    if (isLoading) return;
                    setIsLoading(true);
                    try {
                      console.log('🔄 Resending OTP to:', email);
                      const response = await authAPI.resendOTP(email);
                      if (response.success) {
                        setOtp('');
                        Alert.alert(
                          t(language as LanguageCode, 'auth.otpResent', 'OTP Resent'), 
                          t(language as LanguageCode, 'auth.otpResendSuccess', `New OTP sent to ${email}`)
                        );
                      } else {
                        Alert.alert(
                          t(language as LanguageCode, 'common.error'), 
                          response.message || t(language as LanguageCode, 'auth.otpResendFailed', 'Failed to resend OTP')
                        );
                      }
                    } catch (error) {
                      console.error('Resend OTP Error:', error);
                      Alert.alert(
                        t(language as LanguageCode, 'common.error'), 
                        t(language as LanguageCode, 'auth.otpResendError', 'Failed to resend OTP. Please check your internet connection.')
                      );
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <Text style={styles.forgotPasswordText}>{t(language as LanguageCode, 'auth.resendOTP', 'Resend OTP')}</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t(language as LanguageCode, 'auth.secureAuthentication', 'Secure Authentication')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Info Text */}
            <View style={styles.registerContainer}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
              <Text style={styles.registerText}> {t(language as LanguageCode, 'auth.dataProtected', 'Your data is protected with OTP verification')}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSizes.xxxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  form: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: Spacing.xl,
    ...Shadows.medium,
  },
  formTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: Typography.fontSizes.lg,
    color: Colors.textPrimary,
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
  roleContainer: {
    marginBottom: Spacing.xl,
  },
  roleLabel: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeights.medium,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
    gap: Spacing.xs,
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
  },
  roleText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },
  roleTextActive: {
    color: Colors.textWhite,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: Spacing.md,
  },
  forgotPasswordText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  loginButtonText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textWhite,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: Typography.fontSizes.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },
  languageContainer: {
    marginBottom: Spacing.lg,
  },
  languageLabel: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  languageButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  languageButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  languageText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
  languageTextActive: {
    color: Colors.textWhite,
  },
});
