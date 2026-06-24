import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';

export default function ActivateEsimScreen() {
  const { checkoutPlan, provisionedEsim } = useApp();

  const iccid = provisionedEsim?.iccid ?? 'SIMFY-DEMO-001';
  const activationCode = provisionedEsim?.activationCode ?? '1$smdp.io$TEST-CODE-2024';

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/my-esims')}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>eSIM ACTIVATION</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Success banner */}
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Payment Confirmed!</Text>
          <Text style={styles.successSub}>
            Your eSIM for{' '}
            <Text style={{ color: COLORS.gold }}>{checkoutPlan?.name ?? 'your plan'}</Text> is ready.
          </Text>
        </View>

        {/* ICCID */}
        <View style={[glass.panel, styles.infoCard]}>
          <Text style={styles.infoLabel}>eSIM ICCID</Text>
          <Text style={styles.infoValue} selectable>{iccid}</Text>
        </View>

        {/* Activation code */}
        <View style={[glass.panel, styles.infoCard]}>
          <Text style={styles.infoLabel}>ACTIVATION CODE</Text>
          <Text style={styles.infoValue} selectable>{activationCode}</Text>
        </View>

        {/* Instructions */}
        <View style={[glass.panel, { padding: 18, gap: 16 }]}>
          <Text style={styles.instructTitle}>How to activate your eSIM</Text>
          {[
            { step: '1', text: 'Go to Settings → Cellular / Mobile Data → Add eSIM' },
            { step: '2', text: 'Select "Use QR Code" or enter the activation code manually' },
            { step: '3', text: 'Scan your QR code or paste the activation code above' },
            { step: '4', text: 'Follow your device prompts to complete setup' },
          ].map(s => (
            <View key={s.step} style={styles.instructRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNum}>{s.step}</Text>
              </View>
              <Text style={styles.stepText}>{s.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => router.replace('/(tabs)/my-esims')}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>View My eSIMs</Text>
        </TouchableOpacity>
      </ScrollView>
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
  successBanner: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(148,236,180,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,236,180,0.2)',
  },
  successIcon: { fontSize: 40 },
  successTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  successSub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  infoCard: { padding: 16, gap: 6 },
  infoLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  infoValue: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  instructTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  instructRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderWidth: 1,
    borderColor: COLORS.goldBorderMid,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNum: { color: COLORS.gold, fontSize: 12, fontWeight: '800' },
  stepText: { color: COLORS.textMuted, fontSize: 13, flex: 1, lineHeight: 20 },
  doneBtn: { backgroundColor: COLORS.gold, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  doneBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
