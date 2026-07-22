import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  Animated,
  PanResponder,
  Alert,
  Image,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SkeletonBox } from '../../components/Skeleton';
import Svg, { Circle, G } from 'react-native-svg';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../../components/styles';
import { useApp } from '../../context/AppContext';
import { HERITAGE_IMAGES } from '../../data';
import { ESimSubscription, UsageData } from '../../types';
import { API_BASE } from '../../config';

function formatExpiry(minutes?: number, days?: number): string {
  const total = minutes ?? (days != null ? days * 24 * 60 : 0);
  if (total <= 0) return 'Expired';
  if (total < 60) return `${total}m`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (total < 24 * 60) return m > 0 ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(total / (24 * 60));
  const remH = Math.floor((total % (24 * 60)) / 60);
  if (d === 1) return remH > 0 ? `1 Day ${remH}h` : '1 Day';
  return remH > 0 ? `${d} Days ${remH}h` : `${d} Days`;
}

function formatPaymentDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function formatPlanLabel(planName: string | null, planId: string): string {
  if (planName) return planName;
  return planId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatAmount(amountGhs: number | null): string {
  if (amountGhs == null) return '—';
  return `GHS ${amountGhs.toFixed(2)}`;
}

function DataUsageRing({ usage }: { usage: UsageData | null }) {
  const size = 96;
  const cx = 48, cy = 48, r = 36, sw = 10;
  const circ = 2 * Math.PI * r;

  const usedPct = usage && !usage.unlimited && usage.totalGb > 0
    ? Math.min(100, (usage.usedGb / usage.totalGb) * 100)
    : 0;
  const usedArc = circ * (usedPct / 100);
  const remArc = circ - usedArc;
  const usedRotateDeg = usedPct * 3.6;

  const remainingGb = usage?.remainingGb ?? 0;
  const usedGb = usage?.usedGb ?? 0;
  const isUnlimited = usage?.unlimited ?? false;
  const totalGb = usage?.totalGb ?? 0;

  return (
    <View style={styles.usageWrap}>
      {/* Donut ring */}
      <View style={styles.circleWrap}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Track */}
          <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth={sw} />
          {/* Used — red, from top */}
          {usedPct > 0 && (
            <Circle
              cx={cx} cy={cy} r={r}
              fill="none" stroke="#cc4e3c"
              strokeWidth={sw}
              strokeDasharray={`${usedArc} ${circ}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
            />
          )}
          {/* Remaining — gold, starts after used */}
          <G transform={`rotate(${usedRotateDeg}, ${cx}, ${cy})`}>
            <Circle
              cx={cx} cy={cy} r={r}
              fill="none" stroke="#ffd700"
              strokeWidth={sw}
              strokeDasharray={`${remArc} ${circ}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
            />
          </G>
        </Svg>
        <View style={styles.circleCenter}>
          <Text style={styles.circleLabel}>LEFT</Text>
          <Text style={styles.circleValue}>
            {isUnlimited ? '∞' : remainingGb.toFixed(1)}
          </Text>
          <Text style={styles.circleUnit}>{isUnlimited ? 'UNLIM' : 'GB'}</Text>
        </View>
      </View>

      {/* Usage bar + labels */}
      {!isUnlimited && usage && (
        <View style={styles.usageBar}>
          <View style={styles.usageBarTrack}>
            <View style={[styles.usageBarUsed, { flex: usedPct }]} />
            <View style={[styles.usageBarRem, { flex: 100 - usedPct }]} />
          </View>
          <View style={styles.usageBarLabels}>
            <Text style={styles.usedLabel}>{usedGb.toFixed(2)} used</Text>
            <Text style={styles.totalLabel}>{totalGb} GB total</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.copyFieldWrap}>
      <Text style={styles.copyFieldLabel}>{label}</Text>
      <View style={styles.copyFieldRow}>
        <Text style={styles.copyFieldValue} numberOfLines={1} ellipsizeMode="middle">
          {value}
        </Text>
        <Pressable onPress={handleCopy} style={styles.copyBtnWrap}>
          <Text style={[styles.copyBtnText, copied && styles.copyBtnDoneText]}>
            {copied ? '✓ Copied' : 'Copy'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ProfileSection({ esim }: { esim: ESimSubscription }) {
  const smdp = esim.smdpAddress || 'https://sandbox.esim.com';
  const code = esim.activationCode || 'Not available';
  const iccid = esim.iccid || 'Not available';

  return (
    <View style={styles.profileSection}>
      <Text style={styles.profileTitle}>SCAN eSIM PROFILE QR CODE</Text>

      <View style={styles.qrBox}>
        {esim.qrCodeUrl ? (
          <Image source={{ uri: esim.qrCodeUrl }} style={styles.qrImage} resizeMode="contain" />
        ) : (
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderIcon}>▦</Text>
            <Text style={styles.qrPlaceholderText}>QR Code</Text>
            <Text style={styles.qrPlaceholderSub}>Available after activation</Text>
          </View>
        )}
      </View>

      <Text style={styles.profileInstruction}>
        Go to Settings {'>'} Cellular/Network {'>'} Add eSIM. Then scan this QR.
      </Text>

      <View style={styles.copyFieldsWrap}>
        <CopyField label="SM-DP+ ADDRESS" value={smdp} />
        <CopyField label="ACTIVATION CODE" value={code} />
        <CopyField label="ICCID IDENTIFIER" value={iccid} />
      </View>
    </View>
  );
}

function SwipeableEsimCard({
  esim,
  onDelete,
  onTopUp,
}: {
  esim: ESimSubscription;
  onDelete: (id: string) => void;
  onTopUp: () => void;
}) {
  const isUnlimited = esim.totalDataGb.toLowerCase().includes('unlimited');

  const [showProfile, setShowProfile] = useState(false);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [giftLoading, setGiftLoading] = useState(false);
  const { token } = useApp();

  useEffect(() => {
    if (!esim.dbId || !token) return;
    fetch(`${API_BASE}/api/user/esims/${esim.dbId}/usage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUsage(data); })
      .catch(() => {});
  }, [esim.dbId, token]);
  const swipeX = useRef(new Animated.Value(0)).current;
  const isRevealed = useRef(false);

  const deleteOpacity = swipeX.interpolate({
    inputRange: [-80, -20, 0],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 2,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, { dx }) => {
        const base = isRevealed.current ? -80 : 0;
        swipeX.setValue(Math.max(-80, Math.min(0, base + dx)));
      },
      onPanResponderRelease: (_, { dx }) => {
        const base = isRevealed.current ? -80 : 0;
        const current = Math.max(-80, Math.min(0, base + dx));
        if (current < -50) {
          Animated.spring(swipeX, { toValue: -80, useNativeDriver: true }).start();
          isRevealed.current = true;
        } else {
          Animated.spring(swipeX, { toValue: 0, useNativeDriver: true }).start();
          isRevealed.current = false;
        }
      },
    })
  ).current;

  const handleGift = async () => {
    if (!token) return;
    if (!esim.dbId) {
      Alert.alert('Not Ready', 'eSIM data is still loading. Pull to refresh and try again.');
      return;
    }
    setGiftLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/esims/${esim.dbId}/share`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        Alert.alert('Gift Failed', 'Could not generate a gift link. Please try again.');
        return;
      }
      const { shareUrl } = await res.json();
      try {
        await Share.share({
          message: `I'm gifting you a Simfinity eSIM!\n\nPlan: ${esim.planName}\n\nTap to activate:\n${shareUrl}`,
          title: 'Gift eSIM',
        });
      } catch {
        Alert.alert('Share Error', `Your gift link is ready:\n${shareUrl}`);
      }
    } catch {
      Alert.alert('Network Error', 'Could not reach the server. Make sure the backend is running.');
    } finally {
      setGiftLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Plan',
      `Remove "${esim.planName}" from your account?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            Animated.spring(swipeX, { toValue: 0, useNativeDriver: true }).start();
            isRevealed.current = false;
          },
        },
        { text: 'Remove', style: 'destructive', onPress: () => onDelete(esim.id) },
      ]
    );
  };

  return (
    <View style={styles.swipeWrap}>
      {/* Delete reveal layer — fades in only when swiped */}
      <Animated.View style={[styles.deleteReveal, { opacity: deleteOpacity }]}>
        <Pressable style={styles.deleteRevealBtn} onPress={handleDelete}>
          <Text style={styles.deleteRevealText}>Delete</Text>
        </Pressable>
      </Animated.View>

      {/* Sliding card */}
      <Animated.View
        style={[styles.swipeCard, { transform: [{ translateX: swipeX }] }]}
        {...panResponder.panHandlers}
      >
        <View style={[glass.panel, styles.activeCard]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.planName} numberOfLines={2}>{esim.planName}</Text>
              <Text style={styles.esimId}>ID: {esim.id}</Text>
            </View>
            <View style={[styles.activeBadge, { flexShrink: 0 }]}>
              <Text style={styles.activeBadgeText}>5G Active</Text>
            </View>
          </View>

          {/* Data usage (hidden when profile is shown) */}
          {!showProfile && (
            <View style={styles.activeBody}>
              <DataUsageRing usage={usage ?? {
                totalGb: isUnlimited ? 50 : parseFloat(esim.totalDataGb.match(/[\d.]+/)?.[0] || '0') || 0,
                usedGb: 0,
                remainingGb: isUnlimited ? 50 : parseFloat(esim.totalDataGb.match(/[\d.]+/)?.[0] || '0') || 0,
                usedPercent: 0,
                unlimited: isUnlimited,
                source: 'stored',
              }} />
              <View style={styles.activeStats}>
                <View style={styles.statRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.statLabel}>TOTAL DATA</Text>
                    <Text style={styles.statValue} numberOfLines={1}>{esim.totalDataGb}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0, alignItems: 'flex-end' }}>
                    <Text style={styles.statLabel}>EXPIRES IN</Text>
                    <Text style={[styles.statValue, { textAlign: 'right' }]} numberOfLines={1}>{formatExpiry(esim.expiresInMinutes, esim.expiresInDays)}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Profile / QR section */}
          {showProfile && <ProfileSection esim={esim} />}

          {/* Action buttons */}
          <View style={styles.cardActions}>
            <Pressable
              style={({ pressed }) => [styles.profileActionBtn, pressed && styles.btnPressed]}
              onPress={() => setShowProfile(s => !s)}
            >
              <Text style={styles.profileActionIcon}>⊡</Text>
              <Text style={styles.profileActionText}>
                {showProfile ? 'HIDE\nPROFILE' : 'INSTALL\nPROFILE'}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.giftBtn, pressed && styles.btnPressed, giftLoading && styles.giftBtnLoading]}
              onPress={handleGift}
              disabled={giftLoading}
            >
              <Text style={styles.giftBtnIcon}>↗</Text>
              <Text style={styles.giftBtnText}>GIFT{'\n'}eSIM</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.topUpBtn, pressed && styles.topUpBtnPressed]}
              onPress={onTopUp}
            >
              <Text style={styles.topUpBtnIcon}>+</Text>
              <Text style={styles.topUpBtnText}>TOP UP{'\n'}PLAN</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

export default function MyEsimsScreen() {
  const { activeEsims, pastEsims, token, fetchEsims, user, payments, fetchPayments, setTopUpEsim } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [localActiveEsims, setLocalActiveEsims] = useState<ESimSubscription[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [showAllPayments, setShowAllPayments] = useState(false);

  useEffect(() => { setLocalActiveEsims(activeEsims); }, [activeEsims]);

  useEffect(() => {
    if (token) {
      Promise.all([fetchEsims(token), fetchPayments(token)]).finally(() => setIsLoading(false));
    } else {
      const t = setTimeout(() => setIsLoading(false), 600);
      return () => clearTimeout(t);
    }
  }, [token, fetchEsims, fetchPayments]);

  const handleRefresh = async () => {
    setIsLoading(true);
    if (token) await Promise.all([fetchEsims(token), fetchPayments(token)]);
    setIsLoading(false);
  };

  const handleDeleteEsim = useCallback((id: string) => {
    setLocalActiveEsims(prev => prev.filter(e => e.id !== id));
  }, []);

  const visibleEsims = showAll ? localActiveEsims : localActiveEsims.slice(0, 2);
  const hiddenCount = Math.max(0, localActiveEsims.length - 2);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {user.fullName ? `${user.fullName.split(' ')[0]}'s Dashboard` : 'My Dashboard'}
          </Text>
          <Text style={styles.headerSub} numberOfLines={2}>Manage your global connectivity network accounts.</Text>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activePillText}>SIMFINITY ACTIVE</Text>
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.refreshBtn, isLoading && { opacity: 0.5 }, pressed && styles.btnPressed]}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Text style={styles.refreshIcon}>↻</Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Add New eSIM */}
        <View style={[glass.panel, styles.addCard]}>
          <View style={styles.addIconCircle}>
            <Text style={styles.addIconText}>+</Text>
          </View>
          <Text style={styles.addTitle}>Add New eSIM</Text>
          <Text style={styles.addSub}>Explore regional data plans for your next trip.</Text>
          <Pressable
            style={({ pressed }) => [styles.browsePlansBtn, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Text style={styles.browsePlansBtnText}>BROWSE PLANS</Text>
          </Pressable>
        </View>

        {/* Active Plans */}
        <Text style={styles.sectionHeading}>Active Plans</Text>

        {isLoading ? (
          <View style={[glass.panel, styles.skeletonCard]}>
            <View style={styles.skeletonRow}>
              <SkeletonBox width={120} height={14} />
              <SkeletonBox width={60} height={14} borderRadius={9} />
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 14 }}>
              <SkeletonBox width={96} height={96} borderRadius={48} />
              <View style={{ flex: 1, gap: 10, justifyContent: 'center' }}>
                <SkeletonBox width="60%" height={14} />
                <SkeletonBox width="40%" height={14} />
                <SkeletonBox height={34} borderRadius={8} style={{ marginTop: 4 }} />
              </View>
            </View>
          </View>
        ) : localActiveEsims.length === 0 ? (
          <View style={[glass.panel, styles.emptyCard]}>
            <Text style={styles.emptyText}>No active plans found.</Text>
          </View>
        ) : (
          <>
            {visibleEsims.map(esim => (
              <SwipeableEsimCard
                key={esim.id}
                esim={esim}
                onDelete={handleDeleteEsim}
                onTopUp={() => {
                  setTopUpEsim(esim);
                  router.push('/(tabs)/plans');
                }}
              />
            ))}
            {hiddenCount > 0 && (
              <Pressable
                style={({ pressed }) => [styles.seeMoreBtn, pressed && styles.btnPressed]}
                onPress={() => setShowAll(s => !s)}
              >
                <Text style={styles.seeMoreText}>
                  {showAll
                    ? '↑ Show Less'
                    : `↓ See ${hiddenCount} more plan${hiddenCount > 1 ? 's' : ''}`}
                </Text>
              </Pressable>
            )}
          </>
        )}

        {/* Action pills (image 1 style) */}
        <View style={styles.actionPillsRow}>
          <Pressable
            style={({ pressed }) => [styles.actionPill, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Text style={styles.actionPillText}>BROWSE PLANS</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionPill, pressed && styles.btnPressed]}
            onPress={() => router.push('/(tabs)/plans')}
          >
            <Text style={styles.actionPillText}>TOP UP</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionPill, pressed && styles.btnPressed]}
            onPress={() => router.push('/refer-friend')}
          >
            <Text style={styles.actionPillText}>REFER A FRIEND</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Previous Plans */}
        <Text style={styles.sectionHeading}>Previous Plans</Text>

        {isLoading ? (
          [0, 1].map(i => (
            <View key={i} style={[glass.panel, styles.pastSkeleton]}>
              <SkeletonBox width={160} height={13} />
              <SkeletonBox width={80} height={11} style={{ marginTop: 6 }} />
            </View>
          ))
        ) : pastEsims.length === 0 ? (
          <View style={[glass.panel, styles.emptyCard]}>
            <Text style={styles.emptyText}>No previous plan entries found.</Text>
          </View>
        ) : (
          pastEsims.map(esim => (
            <View key={esim.id} style={[glass.panel, styles.pastCard]}>
              <View style={styles.pastLeft}>
                <View style={styles.pastDot} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.pastName} numberOfLines={2}>{esim.planName}</Text>
                  <Text style={styles.pastDate}>
                    {esim.completedDate ? `Completed on ${esim.completedDate}` : 'Completed'}
                  </Text>
                </View>
              </View>
              <View style={styles.pastRight}>
                <Text style={styles.pastData}>{esim.totalDataGb}</Text>
                <Text style={styles.pastStatus}>Usage Complete</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.divider} />

        {/* Payment History */}
        <Text style={styles.sectionHeading}>Payment History</Text>

        {isLoading ? (
          [0, 1].map(i => (
            <View key={i} style={[glass.panel, styles.pastSkeleton]}>
              <SkeletonBox width={160} height={13} />
              <SkeletonBox width={80} height={11} style={{ marginTop: 6 }} />
            </View>
          ))
        ) : payments.length === 0 ? (
          <View style={[glass.panel, styles.emptyCard]}>
            <Text style={styles.emptyText}>No payment records found.</Text>
          </View>
        ) : (
          <>
            {(showAllPayments ? payments : payments.slice(0, 2)).map(payment => (
              <View key={payment.id} style={[glass.panel, styles.paymentCard]}>
                <View style={styles.paymentLeft}>
                  <View style={styles.paymentIconCircle}>
                    <Text style={styles.paymentIconText}>₵</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentPlanName} numberOfLines={1}>
                      {formatPlanLabel(payment.planName, payment.planId)}
                    </Text>
                    <Text style={styles.paymentDate}>{formatPaymentDate(payment.createdAt)}</Text>
                  </View>
                </View>
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>{formatAmount(payment.amountGhs)}</Text>
                  <View style={styles.paymentStatusBadge}>
                    <Text style={styles.paymentStatusText}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {payments.length > 2 && (
              <Pressable
                style={({ pressed }) => [styles.seeMoreBtn, pressed && styles.btnPressed]}
                onPress={() => setShowAllPayments(s => !s)}
              >
                <Text style={styles.seeMoreText}>
                  {showAllPayments
                    ? '↑ Show Less'
                    : `↓ See ${payments.length - 2} more payment${payments.length - 2 > 1 ? 's' : ''}`}
                </Text>
              </Pressable>
            )}
          </>
        )}

        {/* Refer a Friend Banner */}
        <Pressable
          style={({ pressed }) => [styles.referBanner, pressed && { opacity: 0.85 }]}
          onPress={() => router.push('/refer-friend')}
        >
          <ImageBackground
            source={{ uri: HERITAGE_IMAGES.networkGrid }}
            style={styles.referBg}
            imageStyle={styles.referBgImg}
          >
            <View style={styles.referOverlay} />
            <View style={styles.referContent}>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>PROMO</Text>
              </View>
              <Text style={styles.referTitle}>Refer a Friend</Text>
              <Text style={styles.referSub}>
                Earn 3GB free data for every friend who joins Simfinity. Get gift codes instantly.
              </Text>
            </View>
          </ImageBackground>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  headerTitle: { color: COLORS.gold, fontSize: 20, fontWeight: '800' },
  headerSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,107,63,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0,107,63,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.greenLight },
  activePillText: { color: COLORS.greenLight, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  refreshIcon: { color: COLORS.gold, fontSize: 18, fontWeight: '700' },
  btnPressed: { opacity: 0.6, transform: [{ scale: 0.97 }] },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  addCard: { padding: 20, alignItems: 'center', gap: 8 },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconText: { color: COLORS.textMuted, fontSize: 22, fontWeight: '300' },
  addTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  addSub: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  browsePlansBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  browsePlansBtnText: { color: COLORS.gold, fontSize: 11, fontWeight: '800' },

  sectionHeading: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  skeletonCard: { padding: 18, gap: 12 },
  skeletonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pastSkeleton: { padding: 14, gap: 6 },

  // Swipe container
  swipeWrap: { borderRadius: 16, overflow: 'hidden' },
  swipeCard: { width: '100%' },
  deleteReveal: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#cc3a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteRevealBtn: { alignItems: 'center', paddingHorizontal: 8 },
  deleteRevealText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  // Active card
  activeCard: { padding: 18, gap: 14, borderLeftWidth: 2, borderLeftColor: COLORS.gold },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardHeaderText: { flex: 1 },
  planName: { color: '#fff', fontSize: 14, fontWeight: '700', flexWrap: 'wrap' },
  esimId: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  activeBadge: { backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activeBadgeText: { color: '#000', fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  activeBody: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  usageWrap: { alignItems: 'center', gap: 6 },
  circleWrap: { width: 96, height: 96, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  circleCenter: { position: 'absolute', alignItems: 'center' },
  circleLabel: { color: COLORS.gold, fontSize: 8, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  circleValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  circleUnit: { color: COLORS.textDim, fontSize: 8, textTransform: 'uppercase', marginTop: 1 },
  usageBar: { width: 96, gap: 4 },
  usageBarTrack: { flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: '#2a2a2a' },
  usageBarUsed: { backgroundColor: '#cc4e3c', minWidth: 0 },
  usageBarRem: { backgroundColor: '#ffd700', minWidth: 0 },
  usageBarLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  usedLabel: { color: '#cc4e3c', fontSize: 8, fontWeight: '700' },
  totalLabel: { color: COLORS.textDim, fontSize: 8 },
  activeStats: { flex: 1, gap: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: COLORS.textDim, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },

  // Card action buttons (INSTALL PROFILE + TOP UP PLAN)
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 14,
  },
  profileActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(32,31,31,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  profileActionIcon: { color: COLORS.gold, fontSize: 14 },
  profileActionText: { color: COLORS.gold, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },
  topUpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.gold,
  },
  topUpBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  topUpBtnIcon: { color: '#000', fontSize: 16, fontWeight: '800' },
  topUpBtnText: { color: '#000', fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },
  giftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(148,236,180,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148,236,180,0.25)',
  },
  giftBtnLoading: { opacity: 0.45 },
  giftBtnIcon: { color: '#94ecb4', fontSize: 14, fontWeight: '700' },
  giftBtnText: { color: '#94ecb4', fontSize: 9, fontWeight: '800', letterSpacing: 0.5, textAlign: 'center' },

  // Profile / QR section
  profileSection: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,215,0,0.12)',
    paddingTop: 14,
  },
  profileTitle: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  qrBox: {
    alignSelf: 'center',
    width: 180,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gold,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  qrImage: { width: '100%', height: '100%' },
  qrPlaceholder: {
    alignItems: 'center',
    gap: 4,
  },
  qrPlaceholderIcon: { fontSize: 56, color: '#000' },
  qrPlaceholderText: { color: '#000', fontSize: 12, fontWeight: '800' },
  qrPlaceholderSub: { color: '#555', fontSize: 9, textAlign: 'center' },
  profileInstruction: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  copyFieldsWrap: { gap: 8 },
  copyFieldWrap: { gap: 4 },
  copyFieldLabel: {
    color: COLORS.textDim,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  copyFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32,31,31,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  copyFieldValue: { flex: 1, color: '#fff', fontSize: 11, fontWeight: '600' },
  copyBtnWrap: { paddingHorizontal: 4 },
  copyBtnText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  copyBtnDoneText: { color: COLORS.greenLight },

  // See more button
  seeMoreBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    borderRadius: 10,
    backgroundColor: 'rgba(255,215,0,0.04)',
  },
  seeMoreText: { color: COLORS.gold, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Action pills (image 1 style: Kenya / South Africa / Nigeria)
  actionPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  actionPillText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  divider: { height: 1, backgroundColor: 'rgba(77,71,50,0.3)', marginVertical: 4 },

  emptyCard: { padding: 24, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },

  pastCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
  },
  pastLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  pastDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textDim },
  pastName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pastDate: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  pastRight: { alignItems: 'flex-end' },
  pastData: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  pastStatus: { color: COLORS.textDim, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  // Payment history
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  paymentIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconText: { color: COLORS.gold, fontSize: 14, fontWeight: '800' },
  paymentPlanName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  paymentDate: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  paymentRight: { alignItems: 'flex-end', gap: 4 },
  paymentAmount: { color: COLORS.gold, fontSize: 13, fontWeight: '800' },
  paymentStatusBadge: {
    backgroundColor: 'rgba(0,107,63,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0,107,63,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  paymentStatusText: { color: COLORS.greenLight, fontSize: 9, fontWeight: '800' },

  referBanner: { borderRadius: 16, overflow: 'hidden', height: 144, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  referBg: { flex: 1, justifyContent: 'flex-end' },
  referBgImg: { resizeMode: 'cover' },
  referOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  referContent: { padding: 16, gap: 4 },
  promoBadge: { alignSelf: 'flex-start', backgroundColor: '#cc4e3c', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  promoBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 2 },
  referTitle: { color: COLORS.gold, fontSize: 14, fontWeight: '800', marginTop: 4 },
  referSub: { color: '#d1d1d1', fontSize: 11, lineHeight: 17 },
});
