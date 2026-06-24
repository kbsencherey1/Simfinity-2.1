import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SimfinityLogo } from '../components/SimfinityLogo';
import { COLORS, glass, kenteDivider } from '../components/styles';
import { useApp } from '../context/AppContext';
import { HERITAGE_IMAGES } from '../data';

export default function LoginScreen() {
  const { setIsLoggedIn } = useApp();
  const [email, setEmail] = useState('kwame@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    router.replace('/(tabs)');
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
                  <Text style={styles.inputIcon}>✉ </Text>
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
                  <Text style={styles.inputIcon}>🔒 </Text>
                  <TextInput
                    style={[styles.inputText, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={COLORS.textDim}
                    placeholder="••••••••"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.inputIcon}>{showPassword ? '🙈' : '👁'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Sign In →</Text>
              </TouchableOpacity>

              <View style={kenteDivider.line} />

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.switchLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.footer}>❤  ROOTED IN GHANA</Text>
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
  inputIcon: { fontSize: 16, color: COLORS.textDim, marginRight: 4 },
  inputText: { color: '#fff', fontSize: 14, flex: 1 },
  forgotWrap: { alignSelf: 'flex-end' },
  forgotText: { color: COLORS.gold, fontSize: 12, fontWeight: '600' },
  primaryBtn: { backgroundColor: COLORS.gold, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { color: COLORS.textMuted, fontSize: 13 },
  switchLink: { color: COLORS.gold, fontWeight: '700', fontSize: 13 },
  footer: { color: COLORS.textDim, fontSize: 10, letterSpacing: 2, textAlign: 'center' },
});
