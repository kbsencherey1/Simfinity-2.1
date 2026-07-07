import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { API_BASE } from '../config';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong. Try again.');
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

            <Pressable style={styles.back} onPress={() => router.back()}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            {sent ? (
              <View style={styles.successBox}>
                <View style={styles.iconWrap}>
                  <Text style={styles.icon}>✉</Text>
                </View>
                <Text style={styles.title}>Check your inbox</Text>
                <Text style={styles.sub}>
                  If <Text style={{ color: COLORS.gold }}>{email}</Text> is registered,
                  you'll receive a password reset link shortly.
                </Text>
                <Text style={styles.hint}>
                  Tap the link in the email on your phone — it will open Simfinity directly.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8 }]}
                  onPress={() => router.replace('/login')}
                >
                  <Text style={styles.primaryBtnText}>Back to Sign In</Text>
                </Pressable>
              </View>
            ) : (
              <View style={[glass.panel, styles.card]}>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.sub}>
                  Enter your email and we'll send you a link to reset your password.
                </Text>

                <View style={styles.field}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View style={glass.input}>
                    <View style={styles.inputIconBox}>
                      <Text style={styles.inputIconText}>@</Text>
                    </View>
                    <TextInput
                      style={styles.inputText}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoFocus
                      placeholder="name@example.com"
                      placeholderTextColor={COLORS.textDim}
                    />
                  </View>
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                <Pressable
                  style={({ pressed }) => [styles.primaryBtn, loading && { opacity: 0.6 }, pressed && { opacity: 0.8 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? <ActivityIndicator color="#000" />
                    : <Text style={styles.primaryBtnText}>Send Reset Link</Text>
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
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  backText: { color: COLORS.gold, fontSize: 14, fontWeight: '600' },
  successBox: { alignItems: 'center', gap: 14 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 36 },
  card: { padding: 24, gap: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sub: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  hint: { color: COLORS.textDim, fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 280 },
  field: { gap: 6 },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  inputIconBox: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  inputIconText: { color: COLORS.textDim, fontSize: 12, fontWeight: '700' },
  inputText: { color: '#fff', fontSize: 14, flex: 1 },
  error: { color: '#cc4e3c', fontSize: 12, textAlign: 'center' },
  primaryBtn: { backgroundColor: COLORS.gold, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
