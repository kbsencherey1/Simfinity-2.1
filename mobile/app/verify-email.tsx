import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, TextInput, Platform,
  KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const { user, setUser, token } = useApp();
  const params = useLocalSearchParams<{ email?: string }>();
  const displayEmail = params.email ?? user.email;

  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const verifyCode = async (fullCode: string) => {
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-email-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerified(true);
        setUser({ ...user, emailVerified: true });
        setTimeout(() => router.replace('/(tabs)'), 900);
      } else {
        setError(data.error ?? 'Incorrect code. Try again.');
        setCode('');
      }
    } catch {
      setError('Network error. Make sure the server is running.');
    } finally {
      setVerifying(false);
    }
  };

  const onChangeCode = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    setError(null);
    if (digits.length === CODE_LENGTH) {
      verifyCode(digits);
    }
  };

  const resendEmail = async () => {
    setResending(true);
    setError(null);
    setCode('');
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
        setTimeout(() => setResent(false), 4000);
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >

          <View style={[styles.iconWrap, verified && styles.iconWrapSuccess]}>
            <Text style={styles.icon}>{verified ? '✓' : '✉'}</Text>
          </View>

          <Text style={styles.title}>{verified ? 'Email Verified!' : 'Enter verification code'}</Text>
          {!verified && (
            <>
              <Text style={styles.sub}>We sent a 6-digit code to</Text>
              <Text style={styles.email}>{displayEmail}</Text>
            </>
          )}

          {!verified && (
            <>
              <Pressable style={styles.boxesRow} onPress={() => inputRef.current?.focus()}>
                {Array.from({ length: CODE_LENGTH }).map((_, i) => {
                  const filled = i < code.length;
                  const active = i === code.length;
                  return (
                    <View
                      key={i}
                      style={[styles.box, filled && styles.boxFilled, active && styles.boxActive, !!error && styles.boxError]}
                    >
                      <Text style={styles.boxText}>{code[i] ?? ''}</Text>
                    </View>
                  );
                })}
              </Pressable>

              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={onChangeCode}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                autoFocus
                editable={!verifying}
                style={styles.hiddenInput}
                {...(Platform.OS === 'web' ? { autoComplete: 'one-time-code' } : { textContentType: 'oneTimeCode' })}
              />

              {verifying && <ActivityIndicator size="small" color={COLORS.gold} style={{ marginTop: 4 }} />}
              {error && <Text style={styles.error}>{error}</Text>}

              <View style={[glass.panel, styles.card]}>
                <Text style={styles.cardLabel}>DIDN'T RECEIVE IT?</Text>
                <Text style={styles.cardSub}>Check your spam folder, or tap below to resend.</Text>

                {resent ? (
                  <View style={styles.resentBox}>
                    <Text style={styles.resentText}>✓  New code sent!</Text>
                  </View>
                ) : (
                  <Pressable
                    style={({ pressed }) => [styles.resendBtn, resending && { opacity: 0.6 }, pressed && { opacity: 0.75 }]}
                    onPress={resendEmail}
                    disabled={resending}
                  >
                    {resending
                      ? <ActivityIndicator size="small" color={COLORS.gold} />
                      : <Text style={styles.resendBtnText}>Resend Code</Text>
                    }
                  </Pressable>
                )}
              </View>

              <Pressable
                style={({ pressed }) => [styles.continueBtn, pressed && { opacity: 0.75 }]}
                onPress={() => router.replace('/(tabs)')}
              >
                <Text style={styles.continueBtnText}>Skip For Now</Text>
              </Pressable>
            </>
          )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  iconWrapSuccess: {
    backgroundColor: 'rgba(148,236,180,0.12)',
    borderColor: 'rgba(148,236,180,0.35)',
  },
  icon: { fontSize: 36 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  sub: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center' },
  email: { color: COLORS.gold, fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 8 },

  boxesRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  box: {
    width: 44, height: 54, borderRadius: 10,
    backgroundColor: 'rgba(32,31,31,0.8)',
    borderWidth: 1, borderColor: 'rgba(153,144,119,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  boxFilled: { borderColor: 'rgba(255,215,0,0.4)' },
  boxActive: { borderColor: COLORS.gold, borderWidth: 2 },
  boxError: { borderColor: '#cc4e3c' },
  boxText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },

  card: { width: '100%', padding: 20, gap: 10, marginTop: 16 },
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
  error: { color: '#cc4e3c', fontSize: 12, textAlign: 'center', marginTop: 10 },
  continueBtn: {
    marginTop: 8, paddingVertical: 14, paddingHorizontal: 40,
    borderRadius: 10, backgroundColor: 'transparent',
    borderWidth: 1, borderColor: 'rgba(153,144,119,0.25)',
  },
  continueBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
});
