import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';
import { AvatarImage } from '../components/AvatarImage';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1939 }, (_, i) => String(CURRENT_YEAR - i));

function parseDOB(raw: string) {
  if (!raw) return { day: '', month: '', year: '' };
  const parts = raw.trim().split(' ');
  if (parts.length === 3) return { day: parts[0], month: parts[1], year: parts[2] };
  return { day: '', month: '', year: '' };
}

function formatDOB(day: string, month: string, year: string) {
  if (!day || !month || !year) return '';
  return `${day} ${month} ${year}`;
}

type PickerField = 'day' | 'month' | 'year' | null;

export default function PersonalInfoScreen() {
  const { user, setUser, avatarUrl } = useApp();
  const initialDOB = parseDOB(user.dateOfBirth ?? '');
  const [form, setForm] = useState({ ...user });
  const [dobDay, setDobDay] = useState(initialDOB.day);
  const [dobMonth, setDobMonth] = useState(initialDOB.month);
  const [dobYear, setDobYear] = useState(initialDOB.year);
  const [saved, setSaved] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<PickerField>(null);

  const handleSave = () => {
    const updatedForm = { ...form, dateOfBirth: formatDOB(dobDay, dobMonth, dobYear) };
    setUser(updatedForm);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 1500);
  };

  const pickerOptions = pickerOpen === 'day' ? DAYS : pickerOpen === 'month' ? MONTHS : YEARS;

  const handlePickerSelect = (value: string) => {
    if (pickerOpen === 'day') setDobDay(value);
    else if (pickerOpen === 'month') setDobMonth(value);
    else if (pickerOpen === 'year') setDobYear(value);
    setPickerOpen(null);
  };

  const textFields: { key: keyof typeof form; label: string; placeholder: string; icon: string }[] = [
    { key: 'fullName', label: 'Full Name', placeholder: 'Kwame Mensah', icon: 'N' },
    { key: 'email', label: 'Email Address', placeholder: 'kwame@example.com', icon: '@' },
    { key: 'phoneNumber', label: 'Phone Number', placeholder: '+233 24 555 0123', icon: 'T' },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerLabel}>PERSONAL INFO</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Personal Information</Text>
            <Text style={styles.titleSub}>Acknowledge cellular registration settings</Text>
          </View>

          {saved && (
            <View style={styles.successBar}>
              <Text style={styles.successBarText}>Changes Saved Successfully! Reverting back...</Text>
            </View>
          )}

          {/* Avatar */}
          <View style={[glass.panel, styles.avatarCard]}>
            <View style={styles.avatarWrap}>
              <AvatarImage url={avatarUrl} size={72} />
              <View style={styles.verifiedDot}>
                <Text style={styles.verifiedDotText}>✓</Text>
              </View>
            </View>
            <View style={styles.verifiedRow}>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>Verified Status</Text>
              </View>
            </View>
          </View>

          {/* Text fields */}
          <View style={[glass.panel, styles.formCard]}>
            {textFields.map(f => (
              <View key={f.key} style={styles.field}>
                <Text style={styles.label}>{f.label.toUpperCase()}</Text>
                <View style={glass.input}>
                  <View style={styles.inputIconBox}>
                    <Text style={styles.inputIconText}>{f.icon}</Text>
                  </View>
                  <TextInput
                    style={styles.inputText}
                    value={form[f.key] as string}
                    onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                    placeholder={f.placeholder}
                    placeholderTextColor={COLORS.textDim}
                    keyboardType={f.key === 'email' ? 'email-address' : f.key === 'phoneNumber' ? 'phone-pad' : 'default'}
                    autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                  />
                </View>
              </View>
            ))}

            {/* Date of Birth */}
            <View style={styles.field}>
              <Text style={styles.label}>DATE OF BIRTH</Text>
              <View style={styles.dobRow}>
                {/* Day */}
                <Pressable
                  style={({ pressed }) => [styles.dobPill, pressed && styles.dobPillPressed]}
                  onPress={() => setPickerOpen('day')}
                >
                  <Text style={styles.dobPillLabel}>DAY</Text>
                  <Text style={styles.dobPillValue}>{dobDay || '—'}</Text>
                </Pressable>
                {/* Month */}
                <Pressable
                  style={({ pressed }) => [styles.dobPill, styles.dobPillMonth, pressed && styles.dobPillPressed]}
                  onPress={() => setPickerOpen('month')}
                >
                  <Text style={styles.dobPillLabel}>MONTH</Text>
                  <Text style={styles.dobPillValue}>{dobMonth || '—'}</Text>
                </Pressable>
                {/* Year */}
                <Pressable
                  style={({ pressed }) => [styles.dobPill, pressed && styles.dobPillPressed]}
                  onPress={() => setPickerOpen('year')}
                >
                  <Text style={styles.dobPillLabel}>YEAR</Text>
                  <Text style={styles.dobPillValue}>{dobYear || '—'}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, saved && styles.saveBtnSuccess]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>{saved ? 'Saved!' : 'Save Changes'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date picker modal */}
      <Modal
        visible={pickerOpen !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOpen(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(null)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {pickerOpen === 'day' ? 'Select Day' : pickerOpen === 'month' ? 'Select Month' : 'Select Year'}
            </Text>
            <FlatList
              data={pickerOptions}
              keyExtractor={item => item}
              style={styles.pickerList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = pickerOpen === 'day' ? item === dobDay
                  : pickerOpen === 'month' ? item === dobMonth
                  : item === dobYear;
                return (
                  <Pressable
                    style={({ pressed }) => [styles.pickerItem, isSelected && styles.pickerItemActive, pressed && { opacity: 0.7 }]}
                    onPress={() => handlePickerSelect(item)}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>{item}</Text>
                    {isSelected && <Text style={styles.pickerCheck}>✓</Text>}
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(19,19,19,0.95)',
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
  titleBlock: { gap: 4, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  titleSub: { color: COLORS.textMuted, fontSize: 12 },
  successBar: {
    backgroundColor: 'rgba(0,107,63,0.2)', borderWidth: 1, borderColor: 'rgba(0,107,63,0.4)',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  successBarText: { color: COLORS.greenLight, fontWeight: '700', fontSize: 12 },

  avatarCard: { alignItems: 'center', padding: 20, gap: 12 },
  avatarWrap: { position: 'relative' },
  verifiedDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#1a1a1a',
  },
  verifiedDotText: { color: '#000', fontSize: 10, fontWeight: '900' },
  verifiedRow: { alignItems: 'center' },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,215,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  verifiedBadgeText: { color: COLORS.gold, fontSize: 10, fontWeight: '700' },

  formCard: { padding: 18, gap: 14 },
  field: { gap: 6 },
  label: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  inputIconBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,215,0,0.08)', alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  inputIconText: { color: COLORS.textDim, fontSize: 11, fontWeight: '700' },
  inputText: { color: '#fff', fontSize: 14, flex: 1 },

  dobRow: { flexDirection: 'row', gap: 8 },
  dobPill: {
    flex: 1, paddingVertical: 10, paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
    borderRadius: 10, alignItems: 'center', gap: 2,
  },
  dobPillMonth: { flex: 1.6 },
  dobPillPressed: { borderColor: COLORS.gold, backgroundColor: 'rgba(255,215,0,0.08)' },
  dobPillLabel: { color: COLORS.textDim, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  dobPillValue: { color: '#fff', fontSize: 14, fontWeight: '700' },

  saveBtn: { backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  saveBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  saveBtnSuccess: { backgroundColor: COLORS.ghanaGreen },
  saveBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },

  // Modal
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '60%', paddingBottom: 32,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  modalTitle: { color: COLORS.gold, fontSize: 13, fontWeight: '800', letterSpacing: 1, textAlign: 'center', paddingVertical: 12 },
  pickerList: { paddingHorizontal: 16 },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pickerItemActive: { backgroundColor: 'rgba(255,215,0,0.06)', borderRadius: 8, paddingHorizontal: 8 },
  pickerItemText: { color: '#ccc', fontSize: 15 },
  pickerItemTextActive: { color: COLORS.gold, fontWeight: '700' },
  pickerCheck: { color: COLORS.gold, fontSize: 14, fontWeight: '700' },
});
