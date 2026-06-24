import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';

export default function TravelDocsScreen() {
  const { user, setUser } = useApp();
  const [form, setForm] = useState({
    ghanaCardId: user.ghanaCardId,
    passportNo: user.passportNo,
    passportExpiry: user.passportExpiry,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setUser({ ...user, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = [
    { key: 'ghanaCardId' as const, label: 'Ghana Card ID', placeholder: 'GHA-XXXXXXX-X' },
    { key: 'passportNo' as const, label: 'Passport Number', placeholder: 'AX00000' },
    { key: 'passportExpiry' as const, label: 'Passport Expiry', placeholder: '12 Oct 2028' },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>TRAVEL DOCUMENTS</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Your travel documents are stored securely and encrypted on device. We never share this information without your consent.
            </Text>
          </View>

          {fields.map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label.toUpperCase()}</Text>
              <View style={glass.input}>
                <TextInput
                  style={styles.inputText}
                  value={form[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  placeholder={f.placeholder}
                  placeholderTextColor={COLORS.textDim}
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saved ? '✓ Saved!' : 'Save Documents'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77,71,50,0.3)',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.clay, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  securityNote: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(0,107,63,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,107,63,0.3)',
    borderRadius: 10,
    padding: 14,
    alignItems: 'flex-start',
  },
  securityIcon: { fontSize: 18 },
  securityText: { color: COLORS.greenLight, fontSize: 12, flex: 1, lineHeight: 18 },
  field: { gap: 6 },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  inputText: { color: '#fff', fontSize: 14, flex: 1 },
  saveBtn: { backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnSuccess: { backgroundColor: COLORS.ghanaGreen },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
