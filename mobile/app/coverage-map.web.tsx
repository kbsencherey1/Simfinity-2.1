import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { MapContainer, TileLayer, Circle, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as Location from 'expo-location';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../components/styles';
import { API_BASE } from '../config';

// react-native-maps has no web implementation at all (it imports native-only RN
// internals and crashes the whole web bundle), so this is a parallel, web-native
// implementation using react-leaflet + OpenStreetMap tiles instead. Metro/Expo Router
// automatically prefers this file over coverage-map.tsx when bundling for web.
// Logic (state, endpoints, filtering, GPS) mirrors coverage-map.tsx exactly — only the
// map rendering technology differs.

interface CountryCenter {
  lat: number;
  lng: number;
  latDelta: number;
  lngDelta: number;
  bboxSize: number;
  city: string;
}

const COUNTRY_CENTERS: Record<string, CountryCenter> = {
  GH: { lat: 5.6037,  lng: -0.187,    latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Accra' },
  NG: { lat: 6.5244,  lng: 3.3792,    latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Lagos' },
  ZA: { lat: -26.204, lng: 28.047,    latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Johannesburg' },
  KE: { lat: -1.2921, lng: 36.8219,   latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Nairobi' },
  US: { lat: 40.7128, lng: -74.006,   latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'New York' },
  GB: { lat: 51.5074, lng: -0.1278,   latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'London' },
  DE: { lat: 52.52,   lng: 13.405,    latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Berlin' },
  FR: { lat: 48.8566, lng: 2.3522,    latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Paris' },
  JP: { lat: 35.6762, lng: 139.6503,  latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Tokyo' },
  AU: { lat: -33.869, lng: 151.209,   latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Sydney' },
  CA: { lat: 43.6532, lng: -79.383,   latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Toronto' },
  IN: { lat: 28.7041, lng: 77.1025,   latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Delhi' },
  SG: { lat: 1.3521,  lng: 103.82,    latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Singapore' },
  BR: { lat: -23.55,  lng: -46.633,   latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'São Paulo' },
  MX: { lat: 19.4326, lng: -99.133,   latDelta: 0.025, lngDelta: 0.025, bboxSize: 0.008, city: 'Mexico City' },
};

const DEFAULT_CENTER: CountryCenter = COUNTRY_CENTERS.GH;
const CITY_ZOOM = 15;

interface CoveragePoint {
  lat: number;
  lng: number;
  weight: number;
  signal: number;
  samples: number;
  radio: string;
  network?: string | null;
}

function signalFill(weight: number): string {
  if (weight >= 0.72) return 'rgba(34, 197, 94, 0.38)';
  if (weight >= 0.45) return 'rgba(234, 179, 8, 0.38)';
  if (weight >= 0.22) return 'rgba(249, 115, 22, 0.38)';
  return 'rgba(239, 68, 68, 0.38)';
}

function signalStroke(weight: number): string {
  if (weight >= 0.72) return 'rgba(34, 197, 94, 0.65)';
  if (weight >= 0.45) return 'rgba(234, 179, 8, 0.65)';
  if (weight >= 0.22) return 'rgba(249, 115, 22, 0.65)';
  return 'rgba(239, 68, 68, 0.65)';
}

const LEGEND = [
  { color: '#22c55e', label: 'Excellent' },
  { color: '#eab308', label: 'Good' },
  { color: '#f97316', label: 'Fair' },
  { color: '#ef4444', label: 'Poor' },
] as const;

// Leaflet's default marker icon references image files that don't resolve under
// bundlers (a well-known Leaflet+webpack/Metro issue) — a small inline SVG sidesteps
// it entirely and matches the app's gold branding besides.
const goldPinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:22px;height:22px;border-radius:11px;background:${COLORS.gold};
    border:2px solid #050505;box-shadow:0 0 0 2px rgba(255,215,0,0.35);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

type LocationStatus = 'idle' | 'locating' | 'found' | 'denied' | 'error';

// Imperatively pans/zooms the Leaflet map — the web equivalent of
// react-native-maps' `mapRef.current?.animateToRegion(...)`.
function RecenterMap({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 0.6 });
  }, [lat, lng, zoom, map]);
  return null;
}

export default function CoverageMapScreen() {
  const { country = 'GH', planName = 'Coverage Map', networks = '' } = useLocalSearchParams<{
    country: string;
    planName: string;
    networks?: string;
  }>();

  const planNetworks = (networks as string)
    ? decodeURIComponent(networks as string).split(',').map(n => n.trim()).filter(Boolean)
    : [];

  const countryCenter = COUNTRY_CENTERS[country as string] ?? DEFAULT_CENTER;
  const [mapCenter, setMapCenter] = useState<CountryCenter>(countryCenter);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [points, setPoints] = useState<CoveragePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [networkFilterAvailable, setNetworkFilterAvailable] = useState(false);

  const circleRadius = 250;

  const useMyLocation = useCallback(async () => {
    setLocationStatus('locating');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const next: CountryCenter = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        latDelta: countryCenter.latDelta,
        lngDelta: countryCenter.lngDelta,
        bboxSize: countryCenter.bboxSize,
        city: 'Your Location',
      };
      setMyLocation({ lat: next.lat, lng: next.lng });
      setMapCenter(next);
      setLocationStatus('found');
    } catch {
      setLocationStatus('error');
    }
  }, [countryCenter]);

  useEffect(() => {
    useMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const networksParam = planNetworks.length > 0
          ? `&networks=${encodeURIComponent(planNetworks.join(','))}`
          : '';
        const res = await fetch(
          `${API_BASE}/api/network/coverage?lat=${mapCenter.lat}&lng=${mapCenter.lng}&size=${mapCenter.bboxSize}${networksParam}`
        );
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setPoints(data.points ?? []);
          setNetworkFilterAvailable(Boolean(data.networkFilterAvailable));
        } else {
          setError('Failed to load coverage data.');
        }
      } catch {
        if (!cancelled) setError('Network error — check your connection.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [mapCenter, networks]);

  const displayName = decodeURIComponent(planName as string);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.headerSub}>Coverage · {mapCenter.city}{mapCenter.city !== 'Your Location' ? `, ${country}` : ''}</Text>
          {planNetworks.length > 0 && (
            <Text style={styles.headerNetworks} numberOfLines={1}>
              {networkFilterAvailable ? 'Showing: ' : 'Plan network (unfiltered here): '}{planNetworks.join(', ')}
            </Text>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </SafeAreaView>

      <View style={styles.mapWrap}>
        <MapContainer
          center={[countryCenter.lat, countryCenter.lng]}
          zoom={CITY_ZOOM}
          style={{ height: '100%', width: '100%', background: '#050505' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={mapCenter.lat} lng={mapCenter.lng} zoom={CITY_ZOOM} />

          {myLocation && (
            <Marker position={[myLocation.lat, myLocation.lng]} icon={goldPinIcon} />
          )}
          {points.map((pt, i) => (
            <Circle
              key={i}
              center={[pt.lat, pt.lng]}
              radius={circleRadius}
              pathOptions={{
                fillColor: signalFill(pt.weight),
                fillOpacity: 1,
                color: signalStroke(pt.weight),
                weight: 0.5,
              }}
            />
          ))}
        </MapContainer>

        {isLoading && (
          <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.overlayText}>Fetching tower data…</Text>
          </View>
        )}

        {!isLoading && error && (
          <View style={styles.overlay} pointerEvents="none">
            <Text style={styles.overlayTitle}>Could not load coverage</Text>
            <Text style={styles.overlayText}>{error}</Text>
          </View>
        )}

        {!isLoading && !error && points.length === 0 && (
          <View style={styles.overlay} pointerEvents="none">
            <Text style={styles.overlayTitle}>No data available</Text>
            <Text style={styles.overlayText}>No cell tower records found for this area.</Text>
          </View>
        )}

        {!isLoading && points.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {points.length} tower{points.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [styles.locateBtn, pressed && { opacity: 0.7 }]}
          onPress={useMyLocation}
          disabled={locationStatus === 'locating'}
        >
          {locationStatus === 'locating' ? (
            <ActivityIndicator size="small" color={COLORS.gold} />
          ) : (
            <Text style={styles.locateBtnText}>
              {locationStatus === 'found' ? 'Recenter' : 'Use My Location'}
            </Text>
          )}
        </Pressable>

        {(locationStatus === 'denied' || locationStatus === 'error') && (
          <View style={styles.deniedBanner}>
            <Text style={styles.deniedBannerText}>
              {locationStatus === 'denied'
                ? `Location permission denied — showing ${countryCenter.city} instead. Tap "Use My Location" to try again.`
                : `Couldn't get your location — showing ${countryCenter.city} instead. Tap "Use My Location" to try again.`}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Signal Strength</Text>
        <View style={styles.legendRow}>
          {LEGEND.map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.legendNote}>
          Powered by OpenCellID · Data from crowd-sourced measurements
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050505' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(8,8,8,0.97)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(77,71,50,0.3)',
    gap: 8,
  },
  backBtn: { paddingVertical: 4, paddingRight: 8, minWidth: 56 },
  backText: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  headerSub: { color: COLORS.textDim, fontSize: 10, marginTop: 2 },
  headerNetworks: { color: COLORS.gold, fontSize: 9, fontWeight: '700', marginTop: 2 },
  headerSpacer: { minWidth: 56 },

  mapWrap: { flex: 1, position: 'relative' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,5,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    zIndex: 1000,
  },
  overlayTitle: { color: '#fff', fontSize: 15, fontWeight: '800', textAlign: 'center' },
  overlayText: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },

  countBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(8,8,8,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 1000,
  },
  countBadgeText: { color: COLORS.gold, fontSize: 10, fontWeight: '800' },

  locateBtn: {
    position: 'absolute',
    bottom: 16,
    right: 12,
    backgroundColor: 'rgba(8,8,8,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  locateBtnText: { color: COLORS.gold, fontSize: 11, fontWeight: '700' },

  deniedBanner: {
    position: 'absolute',
    bottom: 60,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(8,8,8,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 1000,
  },
  deniedBannerText: { color: COLORS.textMuted, fontSize: 10.5, textAlign: 'center' },

  legend: {
    backgroundColor: 'rgba(8,8,8,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(77,71,50,0.3)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8,
  },
  legendTitle: {
    color: COLORS.textDim,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  legendRow: { flexDirection: 'row', gap: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { color: COLORS.textMuted, fontSize: 11 },
  legendNote: { color: COLORS.textDim, fontSize: 9, marginTop: 2 },
});
