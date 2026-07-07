import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouristBackground } from '../../components/TouristBackground';
import { SkeletonBox } from '../../components/Skeleton';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../../components/styles';
import { useApp, formatCurrencyPrice } from '../../context/AppContext';
import { INITIAL_PLANS, TOURIST_SPOTS } from '../../data';
import { ESimPlan, GlobalHub } from '../../types';
import { API_BASE } from '../../config';

const GLOBAL_HUBS: GlobalHub[] = [
  {
    id: 'ghana',
    name: 'Accra Black Star Gateway',
    location: 'Accra, Ghana',
    coverage: 'Simfinity 5G Core Fiber Node (Excellent)',
    latency: '11ms',
    speed: '450 Mbps',
    insight: 'The Black Star Gate in Accra symbolises sovereignty and direct backhaul access. High frequency nodes cover the vibrant tech centers and coastal markets of West Africa.',
    symbol: 'GH',
    localWisdomTitle: 'Adinkra: Mpatapo',
    localWisdomMeaning: 'The knot of reconciliation and unbreakable global communication.',
    countryCode: 'GH',
  },
  {
    id: 'usa',
    name: 'New York Silicon Alley Central',
    location: 'New York, USA',
    coverage: 'Simfinity Tier-1 Edge Multipath 5G',
    latency: '8ms',
    speed: '820 Mbps',
    insight: 'Connecting through NYC Hub offers blazing fast routing to transatlantic cables. Perfect coverage spanning high-density downtown blocks, subways, and airport avenues.',
    symbol: 'US',
    localWisdomTitle: 'Smart Grid Connect',
    localWisdomMeaning: 'Transoceanic laser synchronization for ultra-redundancy.',
    countryCode: 'US',
  },
  {
    id: 'uk',
    name: 'London Greenwich Prime Node',
    location: 'London, United Kingdom',
    coverage: 'Simfinity Hyper-Speed Euro Grid (Excellent)',
    latency: '7ms',
    speed: '710 Mbps',
    insight: 'Anchored at the prime meridian, London routing provides double-redundant low-latency cellular handoffs across the UK and continental Europe.',
    symbol: 'GB',
    localWisdomTitle: 'Meridian Precision',
    localWisdomMeaning: 'Zero-meridian alignment for ultra-synchronized global packets.',
    countryCode: 'GB',
  },
  {
    id: 'japan',
    name: 'Tokyo Shinjuku Fiber Backbone',
    location: 'Tokyo, Japan',
    coverage: 'Simfinity Ultra-Dense 5G Solid-State',
    latency: '5ms',
    speed: '950 Mbps',
    insight: 'Superheated millimeter-wave cells handle immense density. Optimal coverage inside high-speed Shinkansen trains and underground hyper-hubs.',
    symbol: 'JP',
    localWisdomTitle: 'Zen Flow Routing',
    localWisdomMeaning: 'Balanced state transition: seamless zero-drop handovers between antennas.',
    countryCode: 'JP',
  },
  {
    id: 'south_africa',
    name: 'Cape Town Table Mountain Relay',
    location: 'Cape Town, South Africa',
    coverage: 'Simfinity Coastal 5G Wavefront (Excellent)',
    latency: '16ms',
    speed: '510 Mbps',
    insight: 'Overlooking two oceans, the Table Mountain relay connects major southern submarine cables, providing beautiful, strong coastline cellular reception.',
    symbol: 'ZA',
    localWisdomTitle: 'Ubuntu Network',
    localWisdomMeaning: '"I am because we are" — a distributed, community-first mesh infrastructure.',
    countryCode: 'ZA',
  },
];

const POPULAR_COUNTRIES = [
  { code: 'GH', name: 'Ghana' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
];

export default function PlansScreen() {
  const { setCheckoutPlan, currency, exchangeRates, topUpEsim, setTopUpEsim } = useApp();
  const [plans, setPlans] = useState<ESimPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('GH');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'low' | 'high'>('low');

  // When entering top-up mode, auto-select the country from the eSIM's planId
  useEffect(() => {
    if (!topUpEsim?.planId) return;
    const codes = POPULAR_COUNTRIES.map(c => c.code);
    const match = topUpEsim.planId.match(new RegExp(`-(${codes.join('|')})-`));
    if (match) setSelectedCountry(match[1]);
  }, [topUpEsim]);

  const fetchPlans = async (code: string) => {
    // 1. Serve cached plans immediately — no loading spinner for returning users
    const cacheKey = `plans_cache_${code}`;
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (raw) {
        const { plans: cached, ts } = JSON.parse(raw);
        const AGE_MS = Date.now() - ts;
        if (cached?.length > 0) {
          setPlans(cached);
          setIsLoading(false);
          // If cache is under 15 min old, skip the network fetch entirely
          if (AGE_MS < 15 * 60 * 1000) return;
        }
      }
    } catch {}

    // 2. Fetch fresh data — silently if we already showed cached plans
    try {
      const res = await fetch(`${API_BASE}/api/zendit/offers?country=${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.plans?.length > 0) {
          setPlans(data.plans);
          setIsLoading(false);
          AsyncStorage.setItem(cacheKey, JSON.stringify({ plans: data.plans, ts: Date.now() }));
          return;
        }
      }
    } catch {}

    // 3. Final fallback
    if (plans.length === 0) {
      setPlans(INITIAL_PLANS);
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPlans(selectedCountry); }, [selectedCountry]);

  let filtered = plans.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dataGb.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.speed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortRate = currency === 'GHS' ? 1 : (exchangeRates[currency] ?? 1);
  filtered = [...filtered].sort((a, b) => {
    const pA = a.priceGhs * sortRate;
    const pB = b.priceGhs * sortRate;
    return sortOrder === 'low' ? pA - pB : pB - pA;
  });

  return (
    <View style={styles.root}>
      <TouristBackground />
      <SafeAreaView edges={['top']} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>

        {/* Ghana Heritage Sites */}
        <View style={styles.heritageSectionHeader}>
          <Text style={styles.heritageSectionTitle}>Ghana Heritage Destinations</Text>
          <Text style={styles.heritageSectionSub}>eSIM plans for these beautiful sites</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heritageScroll}>
          {TOURIST_SPOTS.map(spot => (
            <Pressable
              key={spot.id}
              style={({ pressed }) => [styles.heritageCard, pressed && { opacity: 0.85 }]}
              onPress={() => setSelectedCountry('GH')}
            >
              <Image source={{ uri: spot.imageUrl }} style={styles.heritageCardImg} resizeMode="cover" />
              <View style={styles.heritageCardOverlay} />
              <View style={styles.heritageCardContent}>
                <Text style={styles.heritageCardTag}>GHANA LANDMARK</Text>
                <Text style={styles.heritageCardName} numberOfLines={2}>{spot.name}</Text>
                <Text style={styles.heritageCardLoc} numberOfLines={1}>{spot.location}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Top-up mode banner */}
        {topUpEsim && (
          <View style={styles.topUpBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.topUpBannerLabel}>ADDING DATA TO</Text>
              <Text style={styles.topUpBannerPlan} numberOfLines={1}>{topUpEsim.planName}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.topUpBannerClose, pressed && { opacity: 0.6 }]}
              onPress={() => setTopUpEsim(null)}
            >
              <Text style={styles.topUpBannerCloseText}>×</Text>
            </Pressable>
          </View>
        )}

        {/* Country Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
          {POPULAR_COUNTRIES.map(c => (
            <Pressable
              key={c.code}
              style={({ pressed }) => [
                styles.countryChip,
                selectedCountry === c.code && styles.countryChipActive,
                pressed && styles.btnPressed,
              ]}
              onPress={() => setSelectedCountry(c.code)}
            >
              <View style={[styles.countryCodeBadge, selectedCountry === c.code && styles.countryCodeBadgeActive]}>
                <Text style={[styles.countryCodeText, selectedCountry === c.code && styles.countryCodeTextActive]}>
                  {c.code}
                </Text>
              </View>
              <Text style={[styles.countryName, selectedCountry === c.code && styles.countryNameActive]}>
                {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search + Controls */}
        <View style={[glass.panel, styles.controlsRow]}>
          <View style={[glass.input, styles.searchBox]}>
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={`Search ${selectedCountry} plans…`}
              placeholderTextColor={COLORS.textDim}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.sortBtn, pressed && styles.btnPressed]}
            onPress={() => setSortOrder(s => s === 'low' ? 'high' : 'low')}
          >
            <Text style={styles.sortBtnText}>
              Price: {sortOrder === 'low' ? 'Low → High' : 'High → Low'}
            </Text>
          </Pressable>
        </View>

        {/* Plans */}
        {isLoading ? (
          [0, 1, 2].map(i => (
            <View key={i} style={[glass.panel, styles.planSkeleton]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <SkeletonBox width={60} height={18} borderRadius={9} />
                <SkeletonBox width={80} height={18} borderRadius={4} />
              </View>
              <SkeletonBox width="70%" height={16} style={{ marginBottom: 8 }} />
              <SkeletonBox width="40%" height={13} />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                <SkeletonBox width="30%" height={44} borderRadius={10} />
                <SkeletonBox width="30%" height={44} borderRadius={10} />
                <SkeletonBox width="30%" height={44} borderRadius={10} />
              </View>
            </View>
          ))
        ) : filtered.length === 0 ? (
          <View style={[glass.panel, styles.emptyBox]}>
            <Text style={styles.emptyText}>No carrier offers matched your criteria in this region.</Text>
            <Text style={styles.emptyHint}>Try a different country or clear the search filter.</Text>
          </View>
        ) : (
          filtered.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currency={currency}
              exchangeRates={exchangeRates}
              country={selectedCountry}
              isTopUp={!!topUpEsim}
              onSelect={() => {
                setCheckoutPlan(plan);
                router.push('/checkout');
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function PlanCard({
  plan,
  currency,
  exchangeRates,
  country,
  isTopUp,
  onSelect,
}: {
  plan: ESimPlan;
  currency: string;
  exchangeRates: Record<string, number>;
  country: string;
  isTopUp: boolean;
  onSelect: () => void;
}) {
  const isBest = plan.tag.toLowerCase().includes('best') || plan.tag.toLowerCase().includes('unlimited');
  const primaryPrice = formatCurrencyPrice(plan.priceGhs, currency, exchangeRates);
  const ghsLabel = `GH₵ ${plan.priceGhs.toFixed(2)}`;

  return (
    <View style={[glass.panel, styles.planCard, isBest && styles.planCardBest]}>
      <View style={styles.planHeader}>
        <View style={[styles.planTag, isBest && styles.planTagBest, { flexShrink: 1, maxWidth: '55%' }]}>
          <Text style={[styles.planTagText, isBest && styles.planTagTextBest]} numberOfLines={1}>{plan.tag}</Text>
        </View>
        <View style={[styles.planPriceBox, { flexShrink: 0 }]}>
          <Text style={styles.planPriceMain} numberOfLines={1}>{primaryPrice}</Text>
          {currency !== 'GHS' && (
            <Text style={styles.planPriceAlt} numberOfLines={1}>~ {ghsLabel}</Text>
          )}
        </View>
      </View>

      <Text style={styles.planName} numberOfLines={2}>{plan.name}</Text>
      <Text style={styles.planSpeed}>{plan.speed}</Text>

      <View style={styles.planDetails}>
        <View style={styles.planDetailRow}>
          <View style={[styles.planDetailIcon, { backgroundColor: 'rgba(255,215,0,0.08)' }]}>
            <Text style={styles.planDetailIconText}>D</Text>
          </View>
          <View>
            <Text style={styles.planDetailValue}>{plan.dataGb}</Text>
            <Text style={styles.planDetailLabel}>High-Speed Downlink Cap</Text>
          </View>
        </View>
        <View style={styles.planDetailRow}>
          <View style={[styles.planDetailIcon, { backgroundColor: 'rgba(148,236,180,0.08)' }]}>
            <Text style={[styles.planDetailIconText, { color: '#94ecb4' }]}>V</Text>
          </View>
          <View>
            <Text style={styles.planDetailValue}>{plan.validityDays} {plan.validityDays === 1 ? 'Day' : 'Days'}</Text>
            <Text style={styles.planDetailLabel}>Validity Limit</Text>
          </View>
        </View>
        <View style={styles.planDetailRow}>
          <View style={[styles.planDetailIcon, { backgroundColor: 'rgba(255,215,0,0.08)' }]}>
            <Text style={styles.planDetailIconText}>C</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.planDetailValue} numberOfLines={2}>{plan.culturalInsightTitle}</Text>
            <Text style={[styles.planDetailLabel, { fontStyle: 'italic', marginTop: 2 }]} numberOfLines={3}>{plan.culturalInsightDesc}</Text>
          </View>
        </View>
      </View>

      <View style={styles.planBtnRow}>
        <Pressable
          style={({ pressed }) => [styles.coverageBtn, pressed && styles.btnPressed]}
          onPress={() => router.push(`/coverage-map?country=${country}&planName=${encodeURIComponent(plan.name)}`)}
        >
          <Text style={styles.coverageBtnText}>Coverage Map</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.activateBtn, pressed && styles.activateBtnPressed]}
          onPress={onSelect}
        >
          <Text style={styles.activateBtnText}>{isTopUp ? 'ADD DATA' : 'ACTIVATE NOW'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  headerBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  headerBadge: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headerBadgeText: { color: COLORS.gold, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  headerHubLabel: { color: COLORS.textDim, fontSize: 10 },
  headerTitle: { color: COLORS.gold, fontSize: 16, fontWeight: '800' },
  headerSub: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: { color: COLORS.gold, fontSize: 20, fontWeight: '700' },
  btnPressed: { opacity: 0.6, transform: [{ scale: 0.96 }] },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  heritageSectionHeader: { gap: 2 },
  heritageSectionTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  heritageSectionSub: { color: COLORS.textDim, fontSize: 10 },
  heritageScroll: { marginBottom: 2 },
  heritageCard: {
    width: 160,
    height: 110,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  heritageCardImg: { width: '100%', height: '100%' },
  heritageCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heritageCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 2,
  },
  heritageCardTag: { color: COLORS.gold, fontSize: 7, fontWeight: '800', letterSpacing: 1 },
  heritageCardName: { color: '#fff', fontSize: 11, fontWeight: '700', lineHeight: 14 },
  heritageCardLoc: { color: '#d0cdc8', fontSize: 9 },

  topUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  topUpBannerLabel: { color: COLORS.gold, fontSize: 8, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  topUpBannerPlan: { color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 1 },
  topUpBannerClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUpBannerCloseText: { color: '#fff', fontSize: 18, fontWeight: '300', lineHeight: 20 },

  countryScroll: { marginBottom: 2 },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  countryChipActive: { backgroundColor: 'rgba(255,215,0,0.12)', borderColor: COLORS.gold },
  countryCodeBadge: {
    width: 26,
    height: 18,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeBadgeActive: { backgroundColor: 'rgba(255,215,0,0.2)' },
  countryCodeText: { color: COLORS.textDim, fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  countryCodeTextActive: { color: COLORS.gold },
  countryName: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  countryNameActive: { color: COLORS.gold },

  controlsRow: { padding: 12, gap: 10, flexDirection: 'row', alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortBtnText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },

  planSkeleton: { padding: 18 },
  skel: { backgroundColor: COLORS.clay, borderRadius: 4 },
  emptyBox: { padding: 24, alignItems: 'center', gap: 6 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
  emptyHint: { color: COLORS.textDim, fontSize: 11, textAlign: 'center' },

  planCard: { padding: 18, gap: 12 },
  planCardBest: { borderColor: 'rgba(255,215,0,0.45)', borderWidth: 2 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: COLORS.clay },
  planTagBest: { backgroundColor: COLORS.gold },
  planTagText: { color: COLORS.textDim, fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  planTagTextBest: { color: '#000' },
  planPriceBox: { alignItems: 'flex-end' },
  planPriceMain: { color: COLORS.gold, fontSize: 18, fontWeight: '800' },
  planPriceAlt: { color: COLORS.textDim, fontSize: 10 },
  planName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  planSpeed: { color: COLORS.gold, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  planDetails: { gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  planDetailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  planDetailIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  planDetailIconText: { color: COLORS.gold, fontSize: 11, fontWeight: '900' },
  planDetailValue: { color: '#fff', fontSize: 13, fontWeight: '700' },
  planDetailLabel: { color: COLORS.textDim, fontSize: 9, marginTop: 1 },
  planBtnRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  coverageBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(32,31,31,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  coverageBtnText: { color: COLORS.gold, fontWeight: '700', fontSize: 11 },
  activateBtn: { flex: 1, backgroundColor: COLORS.gold, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  activateBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  activateBtnText: { color: '#000', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
});
