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

export default function PersonalInfoScreen() {
  const { user, setUser } = useApp();
  const [form, setForm] = useState({ ...user });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: 'fullName', label: 'Full Name', placeholder: 'Kwame Mensah' },
    { key: 'email', label: 'Email Address', placeholder: 'kwame@example.com' },
    { key: 'phoneNumber', label: 'Phone Number', placeholder: '+233 24 555 0123' },
    { key: 'dateOfBirth', label: 'Date of Birth', placeholder: '14 May 1992' },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>PERSONAL INFO</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
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
            <Text style={styles.saveBtnText}>{saved ? '✓ Saved!' : 'Save Changes'}</Text>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  field: { gap: 6 },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  inputText: { color: '#fff', fontSize: 14, flex: 1 },
  saveBtn: { backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnSuccess: { backgroundColor: COLORS.ghanaGreen },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
