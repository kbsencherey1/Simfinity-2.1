import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass, kenteDivider } from '../components/styles';
import { useApp } from '../context/AppContext';
import { HERITAGE_IMAGES } from '../data';

export default function ReferFriendScreen() {
  const { referralCode } = useApp();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Simfinity — Ghana's premier travel eSIM service! Use my referral code ${referralCode} for a discount. Download now: https://simfinity.app`,
        title: 'Join Simfinity',
      });
    } catch {}
  };

  const handleCopy = async () => {
    try {
      const Clipboard = require('@react-native-clipboard/clipboard').default;
      Clipboard.setString(referralCode);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>REFER A FRIEND</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={{ uri: HERITAGE_IMAGES.avatarRefer }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={[glass.panel, styles.card]}>
          <Text style={styles.cardTitle}>Share the Simfinity Experience</Text>
          <Text style={styles.cardSub}>
            Invite friends and earn GHS 20 credit for every successful referral. They get a discount too!
          </Text>

          <View style={kenteDivider.line} />

          <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referralCode}</Text>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
              onPress={handleCopy}
            >
              <Text style={styles.copyBtnText}>{copied ? '✓ Copied!' : '📋 Copy Code'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>📤 Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Benefits */}
        <View style={[glass.panel, { padding: 18, gap: 14 }]}>
          <Text style={styles.benefitsTitle}>How It Works</Text>
          {[
            { icon: '🔗', step: 'Share your unique code with friends.' },
            { icon: '📲', step: 'Friend downloads Simfinity and signs up.' },
            { icon: '💳', step: 'They buy any eSIM plan using your code.' },
            { icon: '🎉', step: 'You both earn rewards automatically.' },
          ].map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Text style={styles.benefitIcon}>{b.icon}</Text>
              <Text style={styles.benefitText}>{b.step}</Text>
            </View>
          ))}
        </View>
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
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.clay, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  heroImage: { width: '100%', height: 160, borderRadius: 16 },
  card: { padding: 20, gap: 14 },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  cardSub: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  codeLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  codeBox: {
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderWidth: 1,
    borderColor: COLORS.goldBorderMid,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  codeText: { color: COLORS.gold, fontSize: 20, fontWeight: '800', letterSpacing: 3 },
  btnRow: { flexDirection: 'row', gap: 10 },
  copyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.goldBorderMid,
    alignItems: 'center',
  },
  copyBtnSuccess: { borderColor: COLORS.ghanaGreen, backgroundColor: 'rgba(0,107,63,0.1)' },
  copyBtnText: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
  shareBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.gold, alignItems: 'center' },
  shareBtnText: { color: '#000', fontSize: 13, fontWeight: '800' },
  benefitsTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  benefitIcon: { fontSize: 20 },
  benefitText: { color: COLORS.textMuted, fontSize: 13, flex: 1, lineHeight: 20 },
});
