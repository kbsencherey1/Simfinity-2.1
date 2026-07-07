import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';

export default function VerifyEmailScreen() {
  const { user, token } = useApp();
  const params = useLocalSearchParams<{ email?: string }>();
  const displayEmail = params.email ?? user.email;

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resendEmail = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setResent(true);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Could not resend. Try again later.');
      }
    } catch {
      setError('Network error. Make sure the server is running.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.inner}>

          <View style={styles.iconWrap}>
            <Text style={styles.icon}>✉</Text>
          </View>

          <Text style={styles.title}>Check your email</Text>
          <Text style={styles.sub}>
            We sent a verification link to
          </Text>
          <Text style={styles.email}>{displayEmail}</Text>
          <Text style={styles.hint}>
            Click the link in that email to verify your account. You can continue using the app in the meantime.
          </Text>

          <View style={[glass.panel, styles.card]}>
            <Text style={styles.cardLabel}>DIDN'T RECEIVE IT?</Text>
            <Text style={styles.cardSub}>Check your spam folder, or tap below to resend.</Text>

            {resent ? (
              <View style={styles.resentBox}>
                <Text style={styles.resentText}>✓  Verification email resent!</Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.resendBtn, resending && { opacity: 0.6 }, pressed && { opacity: 0.75 }]}
                onPress={resendEmail}
                disabled={resending}
              >
                {resending
                  ? <ActivityIndicator size="small" color={COLORS.gold} />
                  : <Text style={styles.resendBtnText}>Resend Verification Email</Text>
                }
              </Pressable>
            )}

            {error && <Text style={styles.error}>{error}</Text>}
          </View>

          <Pressable
            style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.75 }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.continueBtnText}>Continue to App</Text>
          </Pressable>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 36 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  sub: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  email: { color: COLORS.gold, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  hint: { color: COLORS.textDim, fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 300 },
  card: { width: '100%', padding: 20, gap: 10, marginTop: 8 },
  cardLabel: { color: COLORS.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  cardSub: { color: COLORS.textDim, fontSize: 12 },
  resendBtn: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  resendBtnText: { color: COLORS.gold, fontWeight: '700', fontSize: 13 },
  resentBox: {
    backgroundColor: 'rgba(148,236,180,0.1)',
    borderWidth: 1, borderColor: 'rgba(148,236,180,0.3)',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center',
  },
  resentText: { color: COLORS.greenLight, fontWeight: '700', fontSize: 13 },
  error: { color: '#cc4e3c', fontSize: 12, textAlign: 'center' },
  continueBtn: {
    marginTop: 8, paddingVertical: 14, paddingHorizontal: 40,
    borderRadius: 10, backgroundColor: COLORS.gold,
  },
  continueBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
