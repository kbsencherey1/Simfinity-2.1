import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SimfinityNavbarLogo } from '../../components/SimfinityLogo';
import { COLORS, glass } from '../../components/styles';
import { HERITAGE_IMAGES } from '../../data';
import { useApp } from '../../context/AppContext';

const API_BASE = '';

export default function HomeScreen() {
  const { isLoggedIn } = useApp();
  const [insight, setInsight] = useState<{ country: string; title: string; fact: string; sources: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('');

  const sampleCountries = ['Kenya', 'South Africa', 'Nigeria', 'Japan', 'Brazil', 'Morocco'];

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

  useEffect(() => { fetchInsight(); }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <SimfinityNavbarLogo size={28} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(isLoggedIn ? '/(tabs)/account' : '/login')}
        >
          <Text style={styles.headerAction}>{isLoggedIn ? '👤' : 'Sign In'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
        {/* Welcome Banner */}
        <View style={[glass.panel, styles.welcomeCard]}>
          <View style={styles.updatedBadge}>
            <Text style={styles.updatedText}>● UPDATED TOUR AVAILABLE</Text>
          </View>
          <Text style={styles.welcomeTitle}>Simfinity Global</Text>
          <Text style={styles.welcomeSub}>
            Seamless travel eSIM coverage across beautiful Ghana, designed with local pride.
          </Text>
          <TouchableOpacity
            style={styles.goldBtn}
            onPress={() => router.push('/(tabs)/plans')}
            activeOpacity={0.85}
          >
            <Text style={styles.goldBtnText}>FIND PLANS 🌍</Text>
          </TouchableOpacity>
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
              <TouchableOpacity onPress={() => router.push('/(tabs)/plans')}>
                <Text style={styles.heroLink}>Browse High-Speed Plans →</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* AI Insight */}
        <View style={[glass.panel, { padding: 20, gap: 14 }]}>
          <Text style={styles.sectionTitle}>🌐 Global Heritage Spotlights</Text>
          <Text style={styles.sectionSub}>Real-time travel trivia powered by Gemini AI.</Text>

          <View style={styles.countryRow}>
            {sampleCountries.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => { setSelectedCountry(c); fetchInsight(c); }}
                style={[styles.countryChip, selectedCountry === c && styles.countryChipActive]}
              >
                <Text style={[styles.countryChipText, selectedCountry === c && styles.countryChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.gold} />
              <Text style={styles.loadingText}>Loading insight…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => fetchInsight()} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : insight ? (
            <View style={styles.insightBox}>
              <Text style={styles.insightCountry}>Spotlight: {insight.country}</Text>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightFact}>{insight.fact}</Text>
            </View>
          ) : null}
        </View>

        {/* Feature bento */}
        <View style={styles.bentoRow}>
          {[
            { icon: '⚡', title: 'Instant Setup', desc: 'Connect in under 60 seconds of scan.' },
            { icon: '💳', title: 'Dual Currency', desc: 'GHS MoMo or Global Credit Cards.' },
            { icon: '🎧', title: '24/7 Support', desc: 'Our team operates out of Accra.' },
          ].map(f => (
            <View key={f.title} style={[glass.panel, styles.bentoCard]}>
              <Text style={styles.bentoIcon}>{f.icon}</Text>
              <Text style={styles.bentoTitle}>{f.title}</Text>
              <Text style={styles.bentoDesc}>{f.desc}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(19,19,19,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77,71,50,0.3)',
  },
  headerAction: { color: COLORS.gold, fontSize: 14, fontWeight: '700' },
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
  goldBtn: { backgroundColor: COLORS.gold, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
  goldBtnText: { color: '#000', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
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
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionSub: { color: COLORS.textMuted, fontSize: 11, marginTop: -8 },
  countryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
  retryBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.clay, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  retryText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },
  insightBox: { gap: 6 },
  insightCountry: { color: COLORS.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  insightTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  insightFact: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  bentoRow: { flexDirection: 'row', gap: 10 },
  bentoCard: { flex: 1, padding: 14, gap: 6, alignItems: 'center', textAlign: 'center' },
  bentoIcon: { fontSize: 24 },
  bentoTitle: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  bentoDesc: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 15 },
});
