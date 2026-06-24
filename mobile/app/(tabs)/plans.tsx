import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, glass } from '../../components/styles';
import { useApp } from '../../context/AppContext';
import { INITIAL_PLANS } from '../../data';
import { ESimPlan } from '../../types';

const API_BASE = '';

interface GlobalHub {
  id: string;
  name: string;
  location: string;
  coverage: string;
  latency: string;
  speed: string;
  insight: string;
  symbol: string;
  localWisdomTitle: string;
  localWisdomMeaning: string;
  countryCode: string;
}

const GLOBAL_HUBS: GlobalHub[] = [
  {
    id: 'ghana',
    name: 'Accra Black Star Gateway',
    location: 'Accra, Ghana',
    coverage: 'Simfinity 5G Core Fiber Node (Excellent)',
    latency: '11ms',
    speed: '450 Mbps',
    insight: 'The Black Star Gate in Accra symbolises sovereignty and direct backhaul access. High frequency nodes cover the vibrant tech centers and coastal markets of West Africa.',
    symbol: '♾',
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
    symbol: '🔗',
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
    symbol: '🌐',
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
    symbol: '⚡',
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
    symbol: '⛵',
    localWisdomTitle: 'Ubuntu Network',
    localWisdomMeaning: '"I am because we are" — a distributed, community-first mesh infrastructure.',
    countryCode: 'ZA',
  },
];

const POPULAR_COUNTRIES = [
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
];

export default function PlansScreen() {
  const { setCheckoutPlan } = useApp();
  const [plans, setPlans] = useState<ESimPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('GH');
  const [searchTerm, setSearchTerm] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'GHS'>('USD');
  const [sortOrder, setSortOrder] = useState<'low' | 'high'>('low');

  const activeHub = GLOBAL_HUBS.find(h => h.countryCode === selectedCountry) || GLOBAL_HUBS[0];

  const fetchPlans = async (code: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/zendit/offers?country=${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.plans?.length > 0) {
          setPlans(data.plans);
          setIsLoading(false);
          return;
        }
      }
    } catch {}
    setPlans(INITIAL_PLANS);
    setIsLoading(false);
  };

  useEffect(() => { fetchPlans(selectedCountry); }, [selectedCountry]);

  let filtered = plans.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.dataGb.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.speed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filtered = [...filtered].sort((a, b) => {
    const pA = currency === 'GHS' ? a.priceGhs : a.priceUsd;
    const pB = currency === 'GHS' ? b.priceGhs : b.priceUsd;
    return sortOrder === 'low' ? pA - pB : pB - pA;
  });

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBadgeRow}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>Multipath Network</Text>
            </View>
            <Text style={styles.headerHubLabel}>Active Hub: {activeHub.location}</Text>
          </View>
          <Text style={styles.headerTitle}>Simfinity Global Exploratorium</Text>
          <Text style={styles.headerSub}>190+ countries · Infinite fiber backhauls · Authentic local insights</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, isLoading && { opacity: 0.5 }]}
          onPress={() => fetchPlans(selectedCountry)}
          disabled={isLoading}
        >
          <Text style={[styles.refreshIcon, isLoading && { opacity: 0.5 }]}>↻</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>

        {/* Global Fiber-Terminal Gateway Card */}
        <View style={[glass.panel, styles.hubCard]}>
          <View style={styles.hubCardHeader}>
            <View>
              <Text style={styles.hubCardTitle}>🔗 Global Fiber-Terminal Gateway</Text>
              <Text style={styles.hubCardSub}>
                View current server-synchronized backhauls, network protocol specifications.
              </Text>
            </View>
          </View>

          <View style={styles.hubInfo}>
            <View style={styles.hubNameRow}>
              <Text style={styles.hubLocation}>📍 {activeHub.location}</Text>
              <Text style={styles.hubName}>{activeHub.name}</Text>
            </View>

            <View style={styles.hubTable}>
              <View style={styles.hubRow}>
                <Text style={styles.hubRowLabel}>Uplink Status:</Text>
                <Text style={[styles.hubRowValue, { color: '#94ecb4' }]}>● SYNCHRONIZED</Text>
              </View>
              <View style={styles.hubRow}>
                <Text style={styles.hubRowLabel}>Direct Latency:</Text>
                <Text style={[styles.hubRowValue, { color: COLORS.gold }]}>{activeHub.latency}</Text>
              </View>
              <View style={styles.hubRow}>
                <Text style={styles.hubRowLabel}>Downlink Carrier:</Text>
                <Text style={styles.hubRowValue}>{activeHub.speed}</Text>
              </View>
              <View style={styles.hubRow}>
                <Text style={styles.hubRowLabel}>Network Protocol:</Text>
                <Text style={[styles.hubRowValue, { flex: 1, textAlign: 'right', flexWrap: 'wrap' }]}>{activeHub.coverage}</Text>
              </View>
            </View>

            <Text style={styles.hubInsight}>{activeHub.insight}</Text>

            <View style={styles.wisdomRow}>
              <Text style={styles.wisdomSymbol}>{activeHub.symbol}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wisdomTitle}>{activeHub.localWisdomTitle}</Text>
                <Text style={styles.wisdomMeaning}>{activeHub.localWisdomMeaning}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Country Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
          {POPULAR_COUNTRIES.map(c => (
            <TouchableOpacity
              key={c.code}
              style={[styles.countryChip, selectedCountry === c.code && styles.countryChipActive]}
              onPress={() => setSelectedCountry(c.code)}
            >
              <Text style={styles.countryFlag}>{c.flag}</Text>
              <Text style={[styles.countryName, selectedCountry === c.code && styles.countryNameActive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search + Controls */}
        <View style={[glass.panel, styles.controlsRow]}>
          <View style={[glass.input, styles.searchBox]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={`Search ${selectedCountry} plans…`}
              placeholderTextColor={COLORS.textDim}
            />
          </View>

          <View style={styles.controlsRight}>
            <View style={styles.currencyToggle}>
              <Text style={styles.currencyLabel}>Currency:</Text>
              <TouchableOpacity
                style={[styles.currencyBtn, currency === 'GHS' && styles.currencyBtnActive]}
                onPress={() => setCurrency('GHS')}
              >
                <Text style={[styles.currencyBtnText, currency === 'GHS' && styles.currencyBtnTextActive]}>GHS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.currencyBtn, currency === 'USD' && styles.currencyBtnActive]}
                onPress={() => setCurrency('USD')}
              >
                <Text style={[styles.currencyBtnText, currency === 'USD' && styles.currencyBtnTextActive]}>USD</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sortBtn}
              onPress={() => setSortOrder(s => s === 'low' ? 'high' : 'low')}
            >
              <Text style={styles.sortBtnText}>
                ↕ Price: {sortOrder === 'low' ? 'Low→High' : 'High→Low'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Plans */}
        {isLoading ? (
          [0, 1, 2].map(i => (
            <View key={i} style={[glass.panel, styles.planSkeleton]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={[styles.skel, { width: 60, height: 18, borderRadius: 9 }]} />
                <View style={[styles.skel, { width: 80, height: 18, borderRadius: 4 }]} />
              </View>
              <View style={[styles.skel, { width: '70%', height: 16, marginBottom: 8 }]} />
              <View style={[styles.skel, { width: '40%', height: 13 }]} />
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
  onSelect,
}: {
  plan: ESimPlan;
  currency: 'USD' | 'GHS';
  onSelect: () => void;
}) {
  const isBest = plan.tag.toLowerCase().includes('best') || plan.tag.toLowerCase().includes('unlimited');

  return (
    <View style={[glass.panel, styles.planCard, isBest && styles.planCardBest]}>
      <View style={styles.planHeader}>
        <View style={[styles.planTag, isBest && styles.planTagBest]}>
          <Text style={[styles.planTagText, isBest && styles.planTagTextBest]}>{plan.tag}</Text>
        </View>
        <View style={styles.planPriceBox}>
          {currency === 'GHS' ? (
            <>
              <Text style={styles.planPriceMain}>GHS {plan.priceGhs}</Text>
              <Text style={styles.planPriceAlt}>~ ${plan.priceUsd} USD</Text>
            </>
          ) : (
            <>
              <Text style={styles.planPriceMain}>${plan.priceUsd} USD</Text>
              <Text style={styles.planPriceAlt}>~ GHS {plan.priceGhs}</Text>
            </>
          )}
        </View>
      </View>

      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planSpeed}>📶 {plan.speed}</Text>

      <View style={styles.planDetails}>
        <View style={styles.planDetailRow}>
          <View style={styles.planDetailIcon}>
            <Text>🗄️</Text>
          </View>
          <View>
            <Text style={styles.planDetailValue}>{plan.dataGb}</Text>
            <Text style={styles.planDetailLabel}>High-Speed Downlink Cap</Text>
          </View>
        </View>
        <View style={styles.planDetailRow}>
          <View style={styles.planDetailIcon}>
            <Text>📅</Text>
          </View>
          <View>
            <Text style={styles.planDetailValue}>{plan.validityDays} {plan.validityDays === 1 ? 'Day' : 'Days'}</Text>
            <Text style={styles.planDetailLabel}>Validity Limit</Text>
          </View>
        </View>
        <View style={styles.planDetailRow}>
          <View style={styles.planDetailIcon}>
            <Text>✨</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.planDetailValue}>{plan.culturalInsightTitle}</Text>
            <Text style={[styles.planDetailLabel, { fontStyle: 'italic', marginTop: 2 }]}>{plan.culturalInsightDesc}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.activateBtn} onPress={onSelect} activeOpacity={0.85}>
        <Text style={styles.activateBtnText}>ACTIVATE NOW</Text>
      </TouchableOpacity>
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
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  hubCard: { padding: 16, gap: 12 },
  hubCardHeader: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 10 },
  hubCardTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  hubCardSub: { color: COLORS.textDim, fontSize: 10, marginTop: 3 },
  hubInfo: { gap: 10 },
  hubNameRow: { gap: 2 },
  hubLocation: { color: COLORS.gold, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  hubName: { color: '#fff', fontSize: 14, fontWeight: '800' },
  hubTable: { gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10 },
  hubRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 3 },
  hubRowLabel: { color: COLORS.textDim, fontSize: 10, flex: 1 },
  hubRowValue: { color: '#fff', fontSize: 10, fontWeight: '700', textAlign: 'right' },
  hubInsight: { color: '#d0cdc8', fontSize: 11, lineHeight: 17 },
  wisdomRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  wisdomSymbol: { fontSize: 20, color: COLORS.gold },
  wisdomTitle: { color: '#fff', fontSize: 11, fontWeight: '700' },
  wisdomMeaning: { color: COLORS.textMuted, fontSize: 10, lineHeight: 16, marginTop: 2 },

  countryScroll: { marginBottom: 2 },
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  countryChipActive: { backgroundColor: 'rgba(255,215,0,0.12)', borderColor: COLORS.gold },
  countryFlag: { fontSize: 18 },
  countryName: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  countryNameActive: { color: COLORS.gold },

  controlsRow: { padding: 12, gap: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, color: '#fff', fontSize: 13 },
  controlsRight: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  currencyToggle: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.clay, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 4, paddingHorizontal: 6 },
  currencyLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  currencyBtn: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  currencyBtnActive: { backgroundColor: COLORS.gold },
  currencyBtnText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  currencyBtnTextActive: { color: '#000' },
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
  planDetailIcon: { width: 32, height: 32, borderRadius: 6, backgroundColor: 'rgba(255,215,0,0.05)', alignItems: 'center', justifyContent: 'center' },
  planDetailValue: { color: '#fff', fontSize: 13, fontWeight: '700' },
  planDetailLabel: { color: COLORS.textDim, fontSize: 9, marginTop: 1 },
  activateBtn: { backgroundColor: COLORS.gold, paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  activateBtnText: { color: '#000', fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
});
