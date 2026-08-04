import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass, kenteDivider } from '../components/styles';
import { useApp } from '../context/AppContext';
import { API_BASE } from '../config';

export default function SignUpScreen() {
  const { loginWithToken, t } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service to continue.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName: name, referredByCode: referralCode.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loginWithToken(data.token, data.email, data.fullName, data.userId);
        router.replace({ pathname: '/verify-email', params: { email: data.email } });
      } else {
        setError(data.error || 'Registration failed. Please try again.');
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>←</Text>
            </Pressable>

            <View style={styles.header}>
              <Text style={styles.heading}>{t('signup.heading')}</Text>
              <Text style={styles.sub}>{t('signup.sub')}</Text>
            </View>

            <View style={[glass.panel, styles.card]}>
              <View style={styles.field}>
                <Text style={styles.label}>{t('signup.fullNameLabel')}</Text>
                <View style={glass.input}>
                  <TextInput
                    style={styles.inputText}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('signup.emailLabel')}</Text>
                <View style={glass.input}>
                  <TextInput
                    style={styles.inputText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('signup.passwordLabel')}</Text>
                <View style={glass.input}>
                  <TextInput
                    style={[styles.inputText, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={({ pressed }) => [styles.showHideBtn, pressed && { opacity: 0.6 }]}
                  >
                    <Text style={styles.showHideText}>{showPassword ? t('login.hide') : t('login.show')}</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('signup.referralLabel')}</Text>
                <View style={glass.input}>
                  <TextInput
                    style={styles.inputText}
                    value={referralCode}
                    onChangeText={setReferralCode}
                    autoCapitalize="characters"
                    placeholderTextColor={COLORS.textDim}
                    placeholder="SIM-XXXX-XXXX"
                  />
                </View>
              </View>

              {/* T&C checkbox */}
              <Pressable
                style={styles.termsRow}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
              >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink} onPress={() => router.push('/privacy-policy')}>
                    Privacy Policy
                  </Text>
                </Text>
              </Pressable>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, loading && { opacity: 0.6 }, pressed && styles.primaryBtnPressed]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>{t('signup.registerButton')}</Text>}
              </Pressable>

              <View style={kenteDivider.line} />

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>{t('signup.haveAccount')}</Text>
                <Pressable onPress={() => router.replace('/login')}>
                  <Text style={styles.switchLink}>{t('common.logIn')}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  backIcon: { color: COLORS.gold, fontSize: 18, fontWeight: '700' },
  header: { gap: 4 },
  heading: { color: '#fff', fontSize: 26, fontWeight: '800' },
  sub: { color: COLORS.textMuted, fontSize: 13 },
  card: { padding: 24, gap: 16 },
  field: { gap: 6 },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  inputText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  showHideBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  showHideText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
    backgroundColor: 'rgba(255,215,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  checkmark: { color: '#000', fontSize: 11, fontWeight: '900' },
  termsText: { color: COLORS.textMuted, fontSize: 12, flex: 1, lineHeight: 18 },
  termsLink: { color: COLORS.gold, fontWeight: '700' },
  primaryBtn: { backgroundColor: COLORS.gold, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  primaryBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { color: COLORS.textMuted, fontSize: 13 },
  switchLink: { color: COLORS.gold, fontWeight: '700', fontSize: 13 },
  errorText: { color: '#cc4e3c', fontSize: 12, textAlign: 'center' },
});
