import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { COLORS, glass } from '../components/styles';
import { TouristBackground } from '../components/TouristBackground';
import { API_BASE } from '../config';

interface GiftDetails {
  planName: string;
  dataGb: string;
  validityDays: number;
  iccid: string;
  activationCode: string;
  smdpAddress: string;
  qrCodeUrl: string;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Pressable style={s.fieldRow} onPress={handleCopy}>
        <Text style={s.fieldValue} numberOfLines={1} ellipsizeMode="middle">{value}</Text>
        <Text style={[s.copyBtn, copied && s.copyBtnDone]}>{copied ? '✓ Copied' : 'Copy'}</Text>
      </Pressable>
    </View>
  );
}

export default function GiftEsimScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [details, setDetails] = useState<GiftDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!token) { setError(true); setLoading(false); return; }
    fetch(`${API_BASE}/api/gift/${token}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setDetails)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <View style={s.root}>
        <TouristBackground />
        <SafeAreaView style={s.centered}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={s.loadingText}>Loading your gift eSIM...</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={s.root}>
        <TouristBackground />
        <SafeAreaView style={s.centered}>
          <Text style={s.errorIcon}>✕</Text>
          <Text style={s.errorTitle}>Gift Not Found</Text>
          <Text style={s.errorSub}>This gift link may have expired or is invalid.</Text>
          <Pressable style={s.primaryBtn} onPress={() => router.replace('/')}>
            <Text style={s.primaryBtnText}>Go to Simfinity</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  const fields = [
    { label: 'SM-DP+ ADDRESS', value: details.smdpAddress },
    { label: 'ACTIVATION CODE', value: details.activationCode },
    { label: 'ICCID IDENTIFIER', value: details.iccid },
  ].filter(f => f.value);

  return (
    <View style={s.root}>
      <TouristBackground />
      <SafeAreaView edges={['top']} style={s.header}>
        <Text style={s.headerTitle}>Gift eSIM</Text>
        <Text style={s.headerSub}>Someone shared this eSIM plan with you</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Plan summary card */}
        <View style={[glass.panel, s.summaryCard]}>
          <View style={s.giftBadge}>
            <Text style={s.giftBadgeText}>GIFTED eSIM</Text>
          </View>
          <Text style={s.planName}>{details.planName}</Text>
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Text style={s.metaValue}>{details.dataGb}</Text>
              <Text style={s.metaLabel}>DATA</Text>
            </View>
            <View style={s.metaDivider} />
            <View style={s.metaItem}>
              <Text style={s.metaValue}>{details.validityDays} days</Text>
              <Text style={s.metaLabel}>VALIDITY</Text>
            </View>
          </View>
        </View>

        {/* Activation card */}
        <View style={[glass.panel, s.activationCard]}>
          <Text style={s.activationTitle}>ACTIVATE YOUR eSIM</Text>
          <Text style={s.activationInstr}>
            Settings → Cellular / Mobile Data → Add eSIM → Use QR Code
          </Text>

          {!!details.qrCodeUrl && (
            <View style={s.qrBox}>
              <Image source={{ uri: details.qrCodeUrl }} style={s.qrImage} resizeMode="contain" />
            </View>
          )}

          {fields.map(f => <CopyRow key={f.label} label={f.label} value={f.value} />)}
        </View>

        <Pressable
          style={({ pressed }) => [s.primaryBtn, pressed && { opacity: 0.85 }]}
          onPress={() => router.replace('/signup')}
        >
          <Text style={s.primaryBtnText}>Download the Simfinity App</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  loadingText: { color: COLORS.textDim, fontSize: 14, marginTop: 12 },
  errorIcon: { color: '#cc4e3c', fontSize: 48, fontWeight: '700' },
  errorTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center' },
  errorSub: { color: COLORS.textDim, fontSize: 14, textAlign: 'center' },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(19,19,19,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77,71,50,0.3)',
    gap: 2,
  },
  headerTitle: { color: COLORS.gold, fontSize: 20, fontWeight: '800' },
  headerSub: { color: COLORS.textDim, fontSize: 12 },

  scroll: { padding: 16, gap: 16, paddingBottom: 40 },

  summaryCard: { padding: 20, gap: 12 },
  giftBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  giftBadgeText: { color: COLORS.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1.2 },
  planName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  metaItem: { alignItems: 'center', gap: 2 },
  metaValue: { color: COLORS.gold, fontSize: 16, fontWeight: '800' },
  metaLabel: { color: COLORS.textDim, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },

  activationCard: { padding: 20, gap: 14 },
  activationTitle: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  activationInstr: { color: COLORS.textDim, fontSize: 12 },

  qrBox: {
    alignSelf: 'center',
    width: 180,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 8,
  },
  qrImage: { width: '100%', height: '100%' },

  fieldWrap: { gap: 4 },
  fieldLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  fieldValue: { flex: 1, color: '#fff', fontSize: 12, fontFamily: 'monospace' },
  copyBtn: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    borderRadius: 6,
  },
  copyBtnDone: { color: '#94ecb4', borderColor: 'rgba(148,236,180,0.3)' },

  primaryBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
