import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../context/ToastContext';

export const OtpScreen = ({ route }: any) => {
  const email = route?.params?.email || '';
  const [otpCode, setOtpCode] = useState(__DEV__ ? '123456' : '');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { verifyOtp, resendOtp } = useAuth();

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerify = async () => {
    if (otpCode.length < 6) {
      toast.error('Vui lòng nhập đủ mã OTP 6 chữ số.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(email, otpCode.trim());
      toast.success('Xác thực tài khoản thành công!');
    } catch (error: any) {
      toast.error(error.message, 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;
    try {
      setResendLoading(true);
      await resendOtp(email);
      toast.success('Mã OTP mới đã được gửi lại vào email của bạn!');
      setCooldown(60);
    } catch (error: any) {
      toast.error(error.message, 'Gửi lại mã thất bại');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Xác Thực Email</Text>
        <Text style={styles.subtitle}>
          Mã OTP 6 số đã được gửi tới:{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>

        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam) để lấy mã xác thực 6 số.
          </Text>
        </View>

        <TextInput
          style={styles.otpInput}
          placeholder="••••••"
          placeholderTextColor="#ccc"
          keyboardType="number-pad"
          maxLength={6}
          value={otpCode}
          onChangeText={setOtpCode}
          autoFocus
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Xác Nhận & Tiếp Tục</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendBtn}
          onPress={handleResend}
          disabled={cooldown > 0 || resendLoading}
        >
          {resendLoading ? (
            <ActivityIndicator size="small" color="#FF4458" />
          ) : (
            <Text style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}>
              {cooldown > 0
                ? `Gửi lại mã sau (${cooldown}s)`
                : 'Chưa nhận được mã? Gửi lại OTP'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  icon: {
    fontSize: 50,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  emailHighlight: {
    color: '#FF4458',
    fontWeight: '700',
  },
  infoBanner: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  infoBannerText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  otpInput: {
    width: '100%',
    height: 60,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF4458',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    color: '#333',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#FF4458',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4458',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resendBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  resendText: {
    color: '#FF4458',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  resendTextDisabled: {
    color: '#94A3B8',
  },
});
