import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass, kenteDivider } from '../components/styles';
import { useApp } from '../context/AppContext';

export default function SignUpScreen() {
  const { setIsLoggedIn } = useApp();
  const [name, setName] = useState('Kwame Mensah');
  const [email, setEmail] = useState('kwame@example.com');
  const [password, setPassword] = useState('password123');

  const handleRegister = () => {
    setIsLoggedIn(true);
    router.replace('/(tabs)');
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
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.heading}>Create Account</Text>
              <Text style={styles.sub}>Start your global connection in West Africa.</Text>
            </View>

            <View style={[glass.panel, styles.card]}>
              <View style={styles.field}>
                <Text style={styles.label}>FULL NAME</Text>
                <View style={glass.input}>
                  <Text style={styles.inputIcon}>👤 </Text>
                  <TextInput
                    style={styles.inputText}
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={COLORS.textDim}
                    placeholder="Kwame Mensah"
                  />
                </View>
              </View>

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
                    placeholder="kwame@example.com"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={glass.input}>
                  <Text style={styles.inputIcon}>🔒 </Text>
                  <TextInput
                    style={styles.inputText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor={COLORS.textDim}
                    placeholder="••••••••"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Register & Connect ✓</Text>
              </TouchableOpacity>

              <View style={kenteDivider.line} />

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/login')}>
                  <Text style={styles.switchLink}>Log In</Text>
                </TouchableOpacity>
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
  inputIcon: { fontSize: 16, color: COLORS.textDim, marginRight: 4 },
  inputText: { color: '#fff', fontSize: 14, flex: 1 },
  primaryBtn: { backgroundColor: COLORS.gold, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { color: COLORS.textMuted, fontSize: 13 },
  switchLink: { color: COLORS.gold, fontWeight: '700', fontSize: 13 },
});
