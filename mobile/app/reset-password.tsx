import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { API_BASE } from '../config';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.'); return;
    }
    if (!token) {
      setError('Invalid reset link. Please request a new one.'); return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDone(true);
      } else {
        setError(data.error ?? 'Could not reset password. Try requesting a new link.');
      }
    } catch {
      setError('Network error. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

            {done ? (
              <View style={styles.successBox}>
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>✓</Text>
                </View>
                <Text style={styles.title}>Password Updated!</Text>
                <Text style={styles.sub}>
                  Your password has been reset successfully. Sign in with your new password.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => router.replace('/login')}
                >
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[glass.panel, styles.card]}>
                <Text style={styles.title}>Set New Password</Text>
                <Text style={styles.sub}>Choose a strong password for your account.</Text>

                <View style={styles.field}>
                  <Text style={styles.label}>NEW PASSWORD</Text>
                  <View style={glass.input}>
                    <View style={styles.inputIconBox}>
                      <Text style={styles.inputIconText}>••</Text>
                    </View>
                    <TextInput
                      style={[styles.inputText, { flex: 1 }]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="Min. 8 characters"
                      placeholderTextColor={COLORS.textDim}
                      autoFocus
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={({ pressed }) => [styles.showHideBtn, pressed && { opacity: 0.6 }]}
                    >
                      <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>CONFIRM PASSWORD</Text>
                  <View style={glass.input}>
                    <View style={styles.inputIconBox}>
                      <Text style={styles.inputIconText}>••</Text>
                    </View>
                    <TextInput
                      style={[styles.inputText, { flex: 1 }]}
                      value={confirm}
                      onChangeText={setConfirm}
                      secureTextEntry={!showPassword}
                      placeholder="Repeat password"
                      placeholderTextColor={COLORS.textDim}
                    />
                  </View>
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, loading && { opacity: 0.6 }, pressed && { opacity: 0.8 }]}
                  onPress={handleReset}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#000" />
                    : <Text style={styles.primaryBtnText}>Reset Password</Text>
                  }
                </Pressable>
              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 20 },
  successBox: { alignItems: 'center', gap: 16 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(148,236,180,0.1)',
    borderWidth: 1, borderColor: 'rgba(148,236,180,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { color: COLORS.greenLight, fontSize: 36, fontWeight: '800' },
  card: { padding: 24, gap: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sub: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  field: { gap: 6 },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  inputIconBox: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  inputIconText: { color: COLORS.textDim, fontSize: 12, fontWeight: '700' },
  inputText: {
    color: '#fff',
    fontSize: 14,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  showHideBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  showHideText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  error: { color: '#cc4e3c', fontSize: 12, textAlign: 'center' },
  primaryBtn: { backgroundColor: COLORS.gold, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
