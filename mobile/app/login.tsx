import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SimfinityLogo } from '../components/SimfinityLogo';
import { COLORS, glass, kenteDivider } from '../components/styles';
import { useApp } from '../context/AppContext';
import { HERITAGE_IMAGES } from '../data';
import { API_BASE } from '../config';

export default function LoginScreen() {
  const { loginWithToken } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loginWithToken(data.token, data.email, data.fullName, data.userId);
        router.replace('/(tabs)');
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('Network error. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground
        source={{ uri: HERITAGE_IMAGES.loginPattern }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.82)' }]} />
      </ImageBackground>

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoArea}>
              <SimfinityLogo size={90} showText />
              <Text style={styles.tagline}>GLOBAL CONNECTIVITY WITH LOCAL SOUL</Text>
            </View>

            <View style={[glass.panel, styles.card]}>
              <Text style={styles.heading}>Welcome Back</Text>

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
                    placeholderTextColor={COLORS.textDim}
                    placeholder="name@example.com"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={glass.input}>
                  <View style={styles.inputIconBox}>
                    <Text style={styles.inputIconText}>••</Text>
                  </View>
                  <TextInput
                    style={[styles.inputText, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={COLORS.textDim}
                    placeholder="••••••••"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={({ pressed }) => [styles.showHideBtn, pressed && { opacity: 0.6 }]}
                  >
                    <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.forgotWrap} onPress={() => router.push('/forgot-password')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Pressable
                style={({ pressed }) => [styles.primaryBtn, loading && { opacity: 0.6 }, pressed && styles.primaryBtnPressed]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
              </Pressable>

              <View style={kenteDivider.line} />

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Don't have an account? </Text>
                <Pressable onPress={() => router.push('/signup')}>
                  <Text style={styles.switchLink}>Create Account</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.footer}>ROOTED IN GHANA</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32, justifyContent: 'center', gap: 24 },
  logoArea: { alignItems: 'center', gap: 10, paddingTop: 20 },
  tagline: { color: COLORS.textDim, fontSize: 9, letterSpacing: 2, fontWeight: '700', textAlign: 'center' },
  card: { padding: 24, gap: 16 },
  heading: { color: '#fff', fontSize: 22, fontWeight: '800' },
  field: { gap: 6 },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  inputIconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  inputIconText: { color: COLORS.textDim, fontSize: 12, fontWeight: '700' },
  inputText: { color: '#fff', fontSize: 14, flex: 1 },
  showHideBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  showHideText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  forgotWrap: { alignSelf: 'flex-end' },
  forgotText: { color: COLORS.gold, fontSize: 12, fontWeight: '600' },
  primaryBtn: { backgroundColor: COLORS.gold, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  primaryBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { color: COLORS.textMuted, fontSize: 13 },
  switchLink: { color: COLORS.gold, fontWeight: '700', fontSize: 13 },
  footer: { color: COLORS.textDim, fontSize: 10, letterSpacing: 2, textAlign: 'center' },
  errorText: { color: '#cc4e3c', fontSize: 12, textAlign: 'center' },
});
