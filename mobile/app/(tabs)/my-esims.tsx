import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../../components/styles';
import { useApp } from '../../context/AppContext';
import { HERITAGE_IMAGES } from '../../data';
import { ESimSubscription } from '../../types';

function CircleProgress({
  pct,
  isUnlimited,
  leftGb,
}: {
  pct: number;
  isUnlimited: boolean;
  leftGb: number;
}) {
  const size = 96;
  const cx = 48;
  const cy = 48;
  const r = 39;
  const sw = 8;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(pct, 100) / 100);

  return (
    <View style={styles.circleWrap}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth={sw} />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#ffd700"
          strokeWidth={sw}
          strokeDasharray={`${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.circleCenter}>
        <Text style={styles.circleLabel}>LEFT</Text>
        <Text style={styles.circleValue}>{isUnlimited ? '∞' : leftGb}</Text>
        <Text style={styles.circleUnit}>{isUnlimited ? 'UNLIM' : 'GB'}</Text>
      </View>
    </View>
  );
}

function ActiveEsimCard({
  esim,
  onTopUp,
}: {
  esim: ESimSubscription;
  onTopUp: () => void;
}) {
  const isUnlimited = esim.totalDataGb.toLowerCase().includes('unlimited');
  const total = isUnlimited ? 100 : (parseFloat(esim.totalDataGb.match(/[\d.]+/)?.[0] || '0') || 100);
  const remaining = isUnlimited ? 100 : Math.min(Math.max(0, esim.leftDataGb), total);
  const pct = (remaining / total) * 100;

  return (
    <View style={[glass.panel, styles.activeCard]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.planName}>{esim.planName}</Text>
          <Text style={styles.esimId}>ID: {esim.id}</Text>
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>5G Active</Text>
        </View>
      </View>

      <View style={styles.activeBody}>
        <CircleProgress pct={pct} isUnlimited={isUnlimited} leftGb={esim.leftDataGb} />

        <View style={styles.activeStats}>
          <View style={styles.statRow}>
            <View>
              <Text style={styles.statLabel}>TOTAL DATA</Text>
              <Text style={styles.statValue}>{esim.totalDataGb}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>EXPIRES IN</Text>
              <Text style={styles.statValue}>{esim.expiresInDays} Days</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.topUpBtn} onPress={onTopUp} activeOpacity={0.85}>
            <Text style={styles.topUpBtnText}>+ TOP UP PLAN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function MyEsimsScreen() {
  const { activeEsims, pastEsims } = useApp();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Manoa's Dashboard</Text>
          <Text style={styles.headerSub}>Manage your global connectivity network accounts.</Text>
          <View style={styles.activePill}>
            <View style={styles.activeDot} />
            <Text style={styles.activePillText}>SIMFINITY ACTIVE</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, isLoading && { opacity: 0.5 }]}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Add New eSIM card */}
        <View style={[glass.panel, styles.addCard]}>
          <View style={styles.addIconCircle}>
            <Text style={styles.addIconText}>+</Text>
          </View>
          <Text style={styles.addTitle}>Add New eSIM</Text>
          <Text style={styles.addSub}>Explore regional data plans for your next trip.</Text>
          <TouchableOpacity
            style={styles.browsePlansBtn}
            onPress={() => router.push('/(tabs)/plans')}
            activeOpacity={0.85}
          >
            <Text style={styles.browsePlansBtnText}>BROWSE PLANS</Text>
          </TouchableOpacity>
        </View>

        {/* Active Plans */}
        <Text style={styles.sectionHeading}>Active Plans</Text>

        {isLoading ? (
          <View style={[glass.panel, styles.skeletonCard]}>
            <View style={styles.skeletonRow}>
              <View style={[styles.skel, { width: 120, height: 14 }]} />
              <View style={[styles.skel, { width: 60, height: 14 }]} />
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
              <View style={[styles.skel, { width: 96, height: 96, borderRadius: 48 }]} />
              <View style={{ flex: 1, gap: 10 }}>
                <View style={[styles.skel, { height: 14, width: '60%' }]} />
                <View style={[styles.skel, { height: 14, width: '40%' }]} />
              </View>
            </View>
          </View>
        ) : activeEsims.length === 0 ? (
          <View style={[glass.panel, styles.emptyCard]}>
            <Text style={styles.emptyText}>No active plans found.</Text>
          </View>
        ) : (
          activeEsims.map(esim => (
            <ActiveEsimCard
              key={esim.id}
              esim={esim}
              onTopUp={() => router.push('/(tabs)/plans')}
            />
          ))
        )}

        <TouchableOpacity
          style={styles.browseOutlineBtn}
          onPress={() => router.push('/(tabs)/plans')}
          activeOpacity={0.8}
        >
          <Text style={styles.browseOutlineBtnText}>🌍 Active Plans Manager (Browse)</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Past Plans */}
        <Text style={styles.sectionHeading}>Previous Plans</Text>

        {isLoading ? (
          [0, 1].map(i => (
            <View key={i} style={[glass.panel, styles.pastSkeleton]}>
              <View style={[styles.skel, { width: 160, height: 13 }]} />
              <View style={[styles.skel, { width: 80, height: 11, marginTop: 6 }]} />
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
                <Text style={styles.pastIcon}>🕐</Text>
                <View>
                  <Text style={styles.pastName}>{esim.planName}</Text>
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

        {/* Refer a Friend Banner */}
        <TouchableOpacity
          style={styles.referBanner}
          onPress={() => router.push('/refer-friend')}
          activeOpacity={0.85}
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
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(19,19,19,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77,71,50,0.3)',
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
  skel: { backgroundColor: COLORS.clay, borderRadius: 6 },
  pastSkeleton: { padding: 14, gap: 6 },

  activeCard: { padding: 18, gap: 14, borderLeftWidth: 2, borderLeftColor: COLORS.gold },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  esimId: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  activeBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  activeBadgeText: { color: '#000', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  activeBody: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  circleWrap: { width: 96, height: 96, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  circleCenter: { position: 'absolute', alignItems: 'center' },
  circleLabel: { color: COLORS.gold, fontSize: 8, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  circleValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  circleUnit: { color: COLORS.textDim, fontSize: 8, textTransform: 'uppercase', marginTop: 1 },
  activeStats: { flex: 1, gap: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: COLORS.textDim, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
  topUpBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  topUpBtnText: { color: '#000', fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  emptyCard: { padding: 24, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },

  browseOutlineBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  browseOutlineBtnText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },

  divider: { height: 1, backgroundColor: 'rgba(77,71,50,0.3)', marginVertical: 4 },

  pastCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
  },
  pastLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pastIcon: { fontSize: 18 },
  pastName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pastDate: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  pastRight: { alignItems: 'flex-end' },
  pastData: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  pastStatus: { color: COLORS.textDim, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },

  referBanner: { borderRadius: 16, overflow: 'hidden', height: 144, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  referBg: { flex: 1, justifyContent: 'flex-end' },
  referBgImg: { resizeMode: 'cover' },
  referOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  referContent: { padding: 16, gap: 4 },
  promoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#cc4e3c',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800', letterSpacing: 2 },
  referTitle: { color: COLORS.gold, fontSize: 14, fontWeight: '800', marginTop: 4 },
  referSub: { color: '#d1d1d1', fontSize: 11, lineHeight: 17 },
});
