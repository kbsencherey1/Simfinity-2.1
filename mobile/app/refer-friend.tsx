import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Share,
  ActivityIndicator,
} from 'react-native';
import * as ExpoClipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../components/styles';
import { useApp } from '../context/AppContext';
import { HERITAGE_IMAGES } from '../data';
import { API_BASE } from '../config';

interface ReferralEntry {
  firstName: string;
  status: 'signed_up' | 'activated';
  joinedAt: string | null;
}

export default function ReferFriendScreen() {
  const { referralCode, token } = useApp();
  const [copied, setCopied] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalReferred, setTotalReferred] = useState(0);
  const [totalActivated, setTotalActivated] = useState(0);
  const [gbEarned, setGbEarned] = useState(0);
  const [referrals, setReferrals] = useState<ReferralEntry[]>([]);

  useEffect(() => {
    if (!token) { setStatsLoading(false); return; }
    fetch(`${API_BASE}/api/user/referrals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setTotalReferred(data.totalReferred ?? 0);
          setTotalActivated(data.totalActivated ?? 0);
          setGbEarned(data.gbEarned ?? 0);
          setReferrals(data.referrals ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [token]);

  const handleCopy = async () => {
    await ExpoClipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join Simfinity — Ghana's premier travel eSIM service! Use my referral code ${referralCode} for a discount. Download now: https://simfinity.app`,
        title: 'Join Simfinity',
      });
    } catch {}
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.headerLabel}>SIMFINITY REWARD</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hero image block */}
        <View style={styles.heroBlock}>
          <View style={styles.heroImageWrap}>
            <Image
              source={{ uri: HERITAGE_IMAGES.networkGrid }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay} />
          </View>
          <Text style={styles.heroTitle}>Share the Gift of Global Soul</Text>
          <Text style={styles.heroSub}>
            Give a friend 1GB data to start their exploration journey, and earn 3GB for yourself of global high-speed value.
          </Text>
        </View>

        {/* Referral Code Box */}
        <View style={[glass.panel, styles.codeCard]}>
          <Text style={styles.codeCardLabel}>Your Unique Code</Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <Pressable
              style={({ pressed }) => [styles.copyBtn, pressed && styles.copyBtnPressed]}
              onPress={handleCopy}
            >
              <Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
            </Pressable>
          </View>

          <View style={styles.shareBtnRow}>
            <Pressable
              style={({ pressed }) => [glass.panel, styles.shareActionBtn, pressed && { opacity: 0.7 }]}
              onPress={handleShare}
            >
              <Text style={styles.shareActionText}>Share Link</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [glass.panel, styles.shareActionBtn, pressed && { opacity: 0.7 }]}
              onPress={handleShare}
            >
              <Text style={styles.shareActionText}>Email Code</Text>
            </Pressable>
          </View>
        </View>

        {/* Referral Stats */}
        <View style={{ gap: 8 }}>
          <Text style={styles.statusLabel}>REFERRAL STATUS</Text>

          {statsLoading ? (
            <View style={[glass.panel, { padding: 24, alignItems: 'center' }]}>
              <ActivityIndicator color={COLORS.gold} />
            </View>
          ) : (
            <>
              {/* Summary chips */}
              <View style={styles.statsRow}>
                <View style={[glass.panel, styles.statChip]}>
                  <Text style={styles.statChipNum}>{totalReferred}</Text>
                  <Text style={styles.statChipLabel}>Invited</Text>
                </View>
                <View style={[glass.panel, styles.statChip]}>
                  <Text style={styles.statChipNum}>{totalActivated}</Text>
                  <Text style={styles.statChipLabel}>Activated</Text>
                </View>
                <View style={[glass.panel, styles.statChip]}>
                  <Text style={[styles.statChipNum, { color: COLORS.greenLight }]}>{gbEarned.toFixed(0)} GB</Text>
                  <Text style={styles.statChipLabel}>Earned</Text>
                </View>
              </View>

              {/* Referral list */}
              {referrals.length === 0 ? (
                <View style={[glass.panel, styles.emptyReferrals]}>
                  <Text style={styles.emptyReferralsText}>No referrals yet — share your code to get started.</Text>
                </View>
              ) : (
                <View style={[glass.panel, styles.statusCard]}>
                  <View style={styles.statusLine} />
                  {referrals.map((r, idx) => {
                    const isActivated = r.status === 'activated';
                    const isLast = idx === referrals.length - 1;
                    return (
                      <View key={idx} style={[styles.statusStep, isLast && { marginBottom: 0 }]}>
                        <View style={[styles.statusStepCircle, isActivated ? styles.statusStepDone : styles.statusStepPartial]}>
                          {isActivated && <Text style={styles.statusStepDoneIcon}>✓</Text>}
                        </View>
                        <View style={styles.statusStepContent}>
                          <Text style={styles.statusStepTitle}>
                            {r.firstName} — {isActivated ? 'Activated' : 'Signed Up'}
                          </Text>
                          <Text style={styles.statusStepDesc}>
                            {r.joinedAt ? `Joined ${r.joinedAt}` : 'Recently joined'}
                            {isActivated ? ' · 3GB reward earned' : ' · Waiting for first activation'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Earn note */}
              <View style={styles.earnNote}>
                <Text style={styles.earnNoteText}>
                  Earn 3GB free data when each referred friend activates their first eSIM plan.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Wisdom Quote */}
        <View style={styles.wisdomBox}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.wisdomLabel}>WISDOM OF THE ANCIENTS</Text>
            <Text style={styles.wisdomQuote}>
              "Obi nkyere abofra Nyame" — Nobody points out God to a child; goodness is self-evident. Share the goodness of Simfinity.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { color: COLORS.gold, fontSize: 18, fontWeight: '700' },
  headerLabel: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },

  heroBlock: { gap: 12, alignItems: 'center' },
  heroImageWrap: { width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  heroSub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  codeCard: { padding: 20, gap: 14 },
  codeCardLabel: { color: COLORS.gold, fontSize: 9, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    borderRadius: 12,
    padding: 14,
  },
  codeText: { color: COLORS.gold, fontSize: 20, fontWeight: '800', letterSpacing: 3 },
  copyBtn: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  copyBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  copyBtnText: { color: '#000', fontWeight: '800', fontSize: 12 },

  shareBtnRow: { flexDirection: 'row', gap: 10 },
  shareActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  shareActionText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },

  statusLabel: { color: COLORS.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  statusCard: { padding: 20, gap: 0, position: 'relative' },
  statusLine: {
    position: 'absolute',
    left: 39,
    top: 28,
    bottom: 28,
    width: 2,
    backgroundColor: 'rgba(77,71,50,0.35)',
  },
  statusStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 24 },
  statusStepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
  },
  statusStepDone: { backgroundColor: COLORS.gold },
  statusStepDoneIcon: { color: '#000', fontSize: 16, fontWeight: '900' },
  statusStepPartial: {
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  statusStepPending: {
    backgroundColor: '#0e0e0e',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusStepPendingIcon: { color: COLORS.textDim, fontSize: 12, fontWeight: '900' },
  statusStepContent: { flex: 1, paddingTop: 8 },
  statusStepTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  statusStepDesc: { color: COLORS.textMuted, fontSize: 11, marginTop: 2, lineHeight: 16 },

  statsRow: { flexDirection: 'row', gap: 8 },
  statChip: { flex: 1, alignItems: 'center', padding: 12, gap: 4 },
  statChipNum: { color: COLORS.gold, fontSize: 22, fontWeight: '900' },
  statChipLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyReferrals: { padding: 20, alignItems: 'center' },
  emptyReferralsText: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  earnNote: {
    backgroundColor: 'rgba(148,236,180,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148,236,180,0.15)',
    borderRadius: 10,
    padding: 12,
  },
  earnNoteText: { color: COLORS.textMuted, fontSize: 11, lineHeight: 17, textAlign: 'center' },

  wisdomBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,215,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  wisdomLabel: { color: COLORS.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  wisdomQuote: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },
});
