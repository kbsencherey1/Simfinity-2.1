import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
  Modal,
} from 'react-native';
import { TouristBackground } from '../../components/TouristBackground';
import { SkeletonBox } from '../../components/Skeleton';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SimfinityNavbarLogo } from '../../components/SimfinityLogo';
import { COLORS, glass } from '../../components/styles';
import { HERITAGE_IMAGES } from '../../data';
import { useApp } from '../../context/AppContext';

import { API_BASE } from '../../config';

const SAMPLE_COUNTRIES = ['Kenya', 'South Africa', 'Nigeria', 'Japan', 'Brazil', 'Morocco', 'India', 'France'];

const TOUR_HIGHLIGHTS = [
  { label: 'S', color: '#ffd700', title: 'Instant eSIM Setup', desc: 'Activate your eSIM in under 60 seconds, no physical SIM needed.' },
  { label: 'G', color: '#94ecb4', title: '190+ Countries', desc: 'One eSIM covers everywhere from Accra to Tokyo to New York.' },
  { label: 'R', color: '#ffd700', title: 'Ghana Rooted', desc: 'Built in Accra with deep pride in West African connectivity culture.' },
  { label: 'P', color: '#94ecb4', title: 'Paystack Secured', desc: 'All payments go through Ghana-trusted Paystack gateway.' },
];

export default function HomeScreen() {
  const { isLoggedIn } = useApp();
  const [insight, setInsight] = useState<{ country: string; title: string; fact: string; sources?: { title: string; url: string }[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [tourVisible, setTourVisible] = useState(false);

  const fetchInsight = async (countryName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = countryName
        ? `${API_BASE}/api/local-insight?country=${encodeURIComponent(countryName)}`
        : `${API_BASE}/api/local-insight`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setInsight(data);
      if (data.country) setSelectedCountry(data.country);
    } catch {
      setError('Insight requires the server. Try connecting to your local API.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRandom = () => {
    const idx = Math.floor(Math.random() * SAMPLE_COUNTRIES.length);
    const country = SAMPLE_COUNTRIES[idx];
    setSelectedCountry(country);
    fetchInsight(country);
  };

  useEffect(() => { fetchInsight(); }, []);

  return (
    <View style={styles.root}>
      <TouristBackground />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => router.push('/(tabs)')}>
          <SimfinityNavbarLogo size={28} />
        </Pressable>
        <Pressable
          onPress={() => router.push(isLoggedIn ? '/(tabs)/account' : '/login')}
          style={({ pressed }) => [styles.headerActionBtn, pressed && styles.pressed]}
        >
          <Text style={styles.headerAction}>{isLoggedIn ? 'Account' : 'Sign In'}</Text>
        </Pressable>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
        {/* Welcome Banner */}
        <View style={[glass.panel, styles.welcomeCard]}>
          <View style={styles.updatedBadge}>
            <Text style={styles.updatedText}>UPDATED TOUR AVAILABLE</Text>
          </View>
          <Text style={styles.welcomeTitle}>Simfinity Global</Text>
          <Text style={styles.welcomeSub}>
            Seamless travel eSIM coverage across beautiful Ghana, designed with local pride.
          </Text>
          <View style={styles.welcomeBtnRow}>
            <Pressable
              style={({ pressed }) => [styles.goldBtn, pressed && styles.goldBtnPressed]}
              onPress={() => router.push('/(tabs)/plans')}
            >
              <Text style={styles.goldBtnText}>FIND PLANS</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.tourBtn, pressed && styles.tourBtnPressed]}
              onPress={() => setTourVisible(true)}
            >
              <Text style={styles.tourBtnText}>SIMFINITY TOUR</Text>
            </Pressable>
          </View>
        </View>

        {/* Hero image */}
        <View style={styles.heroCard}>
          <ImageBackground
            source={{ uri: HERITAGE_IMAGES.landscapeAccra }}
            style={styles.heroImage}
            imageStyle={{ borderRadius: 16 }}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTag}>NATIONWIDE COVERAGE</Text>
              <Text style={styles.heroTitle}>Stay Connected Anywhere</Text>
              <Text style={styles.heroSub}>
                From the bustling markets of Kejetia to the serene shores of Busua.
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/plans')}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text style={styles.heroLink}>Browse High-Speed Plans</Text>
              </Pressable>
            </View>
          </ImageBackground>
        </View>

        {/* AI Insight */}
        <View style={[glass.panel, { padding: 20, gap: 14 }]}>
          <View style={styles.insightHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Global Heritage Spotlights</Text>
              <Text style={styles.sectionSub}>Real-time travel trivia powered by Gemini AI.</Text>
            </View>
            <Pressable
              onPress={fetchRandom}
              style={({ pressed }) => [styles.randomBtn, pressed && styles.pressed]}
            >
              <Text style={styles.randomBtnText}>Random</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.countryRow}>
              {SAMPLE_COUNTRIES.map(c => (
                <Pressable
                  key={c}
                  onPress={() => { setSelectedCountry(c); fetchInsight(c); }}
                  style={({ pressed }) => [
                    styles.countryChip,
                    selectedCountry === c && styles.countryChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.countryChipText, selectedCountry === c && styles.countryChipTextActive]}>
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {isLoading ? (
            <View style={{ gap: 10, paddingVertical: 4 }}>
              <SkeletonBox width="40%" height={10} borderRadius={4} />
              <SkeletonBox width="75%" height={16} />
              <SkeletonBox height={13} />
              <SkeletonBox height={13} />
              <SkeletonBox width="55%" height={13} />
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                onPress={() => fetchInsight()}
                style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
              >
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : insight ? (
            <View style={styles.insightBox}>
              <Text style={styles.insightCountry}>Spotlight: {insight.country}</Text>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightFact}>{insight.fact}</Text>
              {insight.sources && insight.sources.length > 0 && (
                <View style={styles.sourcesBox}>
                  <Text style={styles.sourcesLabel}>SOURCES</Text>
                  {insight.sources.map((s, i) => (
                    <Text key={i} style={styles.sourceItem} numberOfLines={1}>
                      {'•'} {s.title}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ) : null}
        </View>

        {/* Feature bento */}
        <View style={styles.bentoRow}>
          {[
            { accent: '#ffd700', label: 'S', title: 'Instant Setup', desc: 'Connect in under 60 seconds of scan.' },
            { accent: '#94ecb4', label: 'C', title: 'Dual Currency', desc: 'GHS MoMo or Global Credit Cards.' },
            { accent: '#ffd700', label: '24', title: '24/7 Support', desc: 'Our team operates out of Accra.' },
          ].map(f => (
            <View key={f.title} style={[glass.panel, styles.bentoCard]}>
              <View style={[styles.bentoAccent, { backgroundColor: f.accent + '22', borderColor: f.accent + '44' }]}>
                <Text style={[styles.bentoAccentText, { color: f.accent }]}>{f.label}</Text>
              </View>
              <Text style={styles.bentoTitle}>{f.title}</Text>
              <Text style={styles.bentoDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Authentic & Secure bottom bar */}
        <View style={styles.secureBar}>
          <View style={styles.secureItem}>
            <View style={[styles.secureIcon, { backgroundColor: 'rgba(255,215,0,0.1)' }]}>
              <Text style={[styles.secureIconText, { color: COLORS.gold }]}>A</Text>
            </View>
            <Text style={styles.secureLabel}>Authentic</Text>
          </View>
          <View style={styles.secureDivider} />
          <View style={styles.secureItem}>
            <View style={[styles.secureIcon, { backgroundColor: 'rgba(148,236,180,0.1)' }]}>
              <Text style={[styles.secureIconText, { color: COLORS.greenLight }]}>S</Text>
            </View>
            <Text style={styles.secureLabel}>Secure</Text>
          </View>
          <View style={styles.secureDivider} />
          <View style={styles.secureItem}>
            <View style={[styles.secureIcon, { backgroundColor: 'rgba(255,215,0,0.1)' }]}>
              <Text style={[styles.secureIconText, { color: COLORS.gold }]}>G</Text>
            </View>
            <Text style={styles.secureLabel}>Ghana Rooted</Text>
          </View>
        </View>
      </ScrollView>

      {/* SIMFINITY TOUR Modal */}
      <Modal
        visible={tourVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTourVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SIMFINITY TOUR</Text>
              <Pressable
                onPress={() => setTourVisible(false)}
                style={({ pressed }) => [styles.modalClose, pressed && { opacity: 0.6 }]}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </Pressable>
            </View>
            <Text style={styles.modalSub}>Everything you need to know about Simfinity.</Text>
            <ScrollView style={{ marginTop: 16 }} showsVerticalScrollIndicator={false}>
              {TOUR_HIGHLIGHTS.map(h => (
                <View key={h.title} style={styles.tourItem}>
                  <View style={[styles.tourIcon, { backgroundColor: h.color + '18', borderColor: h.color + '40' }]}>
                    <Text style={[styles.tourIconText, { color: h.color }]}>{h.label}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tourItemTitle}>{h.title}</Text>
                    <Text style={styles.tourItemDesc}>{h.desc}</Text>
                  </View>
                </View>
              ))}
              <Pressable
                style={({ pressed }) => [styles.tourGetStarted, pressed && { backgroundColor: '#e6c200' }]}
                onPress={() => { setTourVisible(false); router.push('/(tabs)/plans'); }}
              >
                <Text style={styles.tourGetStartedText}>Get Started</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  headerAction: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.6 },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },

  welcomeCard: { padding: 20, gap: 10 },
  updatedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(204,78,60,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  updatedText: { color: '#cc4e3c', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  welcomeTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  welcomeSub: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  welcomeBtnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  goldBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  goldBtnPressed: { backgroundColor: '#e6c200', transform: [{ scale: 0.97 }] },
  goldBtnText: { color: '#000', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  tourBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  tourBtnPressed: { backgroundColor: 'rgba(255,215,0,0.08)', transform: [{ scale: 0.97 }] },
  tourBtnText: { color: COLORS.gold, fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },

  heroCard: { borderRadius: 16, overflow: 'hidden' },
  heroImage: { height: 200 },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 20,
    justifyContent: 'flex-end',
    gap: 4,
  },
  heroTag: { color: COLORS.gold, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroSub: { color: '#e5e5e5', fontSize: 12, lineHeight: 18 },
  heroLink: { color: COLORS.gold, fontSize: 11, fontWeight: '700', marginTop: 8 },

  insightHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  randomBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    marginTop: 2,
  },
  randomBtnText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  countryRow: { flexDirection: 'row', gap: 6 },
  countryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.clay,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countryChipActive: { backgroundColor: COLORS.gold },
  countryChipText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  countryChipTextActive: { color: '#000' },
  loadingBox: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  loadingText: { color: COLORS.textDim, fontSize: 12 },
  errorBox: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  errorText: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.clay,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  retryText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  insightBox: { gap: 6 },
  insightCountry: { color: COLORS.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  insightTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  insightFact: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  sourcesBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,215,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
    gap: 4,
  },
  sourcesLabel: { color: COLORS.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 2 },
  sourceItem: { color: COLORS.textDim, fontSize: 10, lineHeight: 16 },

  bentoRow: { flexDirection: 'row', gap: 10 },
  bentoCard: { flex: 1, padding: 14, gap: 8, alignItems: 'center' },
  bentoAccent: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoAccentText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  bentoTitle: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  bentoDesc: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 15 },

  secureBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(77,71,50,0.2)',
  },
  secureItem: { alignItems: 'center', gap: 6 },
  secureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureIconText: { fontSize: 12, fontWeight: '900' },
  secureLabel: { color: COLORS.textDim, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  secureDivider: { width: 1, height: 30, backgroundColor: 'rgba(77,71,50,0.3)' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#131313',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,215,0,0.15)',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { color: COLORS.gold, fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  modalClose: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  modalCloseText: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  modalSub: { color: COLORS.textMuted, fontSize: 12, marginTop: 6 },
  tourItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 18 },
  tourIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tourIconText: { fontSize: 13, fontWeight: '900' },
  tourItemTitle: { color: '#fff', fontSize: 13, fontWeight: '700', marginBottom: 3 },
  tourItemDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  tourGetStarted: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  tourGetStartedText: { color: '#000', fontWeight: '800', fontSize: 14 },
});
