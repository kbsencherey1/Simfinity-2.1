import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../components/styles';
import { API_BASE } from '../config';

interface CountryCenter {
  lat: number;
  lng: number;
  latDelta: number;
  lngDelta: number;
  bboxSize: number;
  city: string;
}

// OpenCellID free tier limits BBOX to ~4,000,000 sq.m (~1km radius).
// bboxSize is in degrees; 0.008° ≈ 890m at the equator → safely under the limit.
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

const LEGEND = [
  { color: '#22c55e', label: 'Excellent' },
  { color: '#eab308', label: 'Good' },
  { color: '#f97316', label: 'Fair' },
  { color: '#ef4444', label: 'Poor' },
] as const;

type LocationStatus = 'idle' | 'locating' | 'found' | 'denied' | 'error';

// Static Leaflet + OpenStreetMap page — no Google Maps / API key needed, unlike
// react-native-maps. Kept fully static (no interpolated data) and driven entirely
// via injectJavaScript calls from React Native, so there's never a risk of dynamic
// values (coordinates, weights) breaking the embedded HTML/JS.
const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #050505; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: true })
      .setView([${DEFAULT_CENTER.lat}, ${DEFAULT_CENTER.lng}], ${CITY_ZOOM});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    var circleLayer = L.layerGroup().addTo(map);
    var markerLayer = L.layerGroup().addTo(map);

    var goldIcon = L.divIcon({
      className: '',
      html: '<div style="width:22px;height:22px;border-radius:11px;background:#FFD700;border:2px solid #1a1a1a;box-shadow:0 0 0 1px rgba(255,255,255,0.3);"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    function fillColorFor(w) {
      if (w >= 0.72) return 'rgba(34, 197, 94, 0.38)';
      if (w >= 0.45) return 'rgba(234, 179, 8, 0.38)';
      if (w >= 0.22) return 'rgba(249, 115, 22, 0.38)';
      return 'rgba(239, 68, 68, 0.38)';
    }
    function strokeColorFor(w) {
      if (w >= 0.72) return 'rgba(34, 197, 94, 0.65)';
      if (w >= 0.45) return 'rgba(234, 179, 8, 0.65)';
      if (w >= 0.22) return 'rgba(249, 115, 22, 0.65)';
      return 'rgba(239, 68, 68, 0.65)';
    }

    function recenter(lat, lng, zoom) {
      map.flyTo([lat, lng], zoom, { duration: 0.6 });
    }

    function setMyLocation(lat, lng) {
      markerLayer.clearLayers();
      L.marker([lat, lng], { icon: goldIcon }).addTo(markerLayer);
    }

    function setPoints(pointsJson) {
      var points = JSON.parse(pointsJson);
      circleLayer.clearLayers();
      points.forEach(function (pt) {
        L.circle([pt.lat, pt.lng], {
          radius: 250,
          fillColor: fillColorFor(pt.weight),
          fillOpacity: 1,
          color: strokeColorFor(pt.weight),
          weight: 0.5,
        }).addTo(circleLayer);
      });
    }

    window.isMapReady = true;
  </script>
</body>
</html>
`;

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
  const [mapReady, setMapReady] = useState(false);
  const webViewRef = useRef<WebView>(null);

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

  // Show the country center immediately (no regression / no wait on a permission
  // prompt), then silently upgrade to the user's real GPS location if granted.
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

  // Push state into the map only once the page has actually finished loading —
  // these effects fire on data changes that can happen before or after that.
  useEffect(() => {
    if (!mapReady) return;
    webViewRef.current?.injectJavaScript(
      `recenter(${mapCenter.lat}, ${mapCenter.lng}, ${CITY_ZOOM}); true;`
    );
  }, [mapReady, mapCenter]);

  useEffect(() => {
    if (!mapReady || !myLocation) return;
    webViewRef.current?.injectJavaScript(
      `setMyLocation(${myLocation.lat}, ${myLocation.lng}); true;`
    );
  }, [mapReady, myLocation]);

  useEffect(() => {
    if (!mapReady) return;
    webViewRef.current?.injectJavaScript(
      `setPoints(${JSON.stringify(JSON.stringify(points))}); true;`
    );
  }, [mapReady, points]);

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
        <WebView
          ref={webViewRef}
          style={styles.map}
          source={{ html: MAP_HTML }}
          onLoadEnd={() => setMapReady(true)}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />

        {(isLoading || !mapReady) && (
          <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.overlayText}>Fetching tower data…</Text>
          </View>
        )}

        {mapReady && !isLoading && error && (
          <View style={styles.overlay} pointerEvents="none">
            <Text style={styles.overlayTitle}>Could not load coverage</Text>
            <Text style={styles.overlayText}>{error}</Text>
          </View>
        )}

        {mapReady && !isLoading && !error && points.length === 0 && (
          <View style={styles.overlay} pointerEvents="none">
            <Text style={styles.overlayTitle}>No data available</Text>
            <Text style={styles.overlayText}>No cell tower records found for this area.</Text>
          </View>
        )}

        {/* Tower count badge */}
        {mapReady && !isLoading && points.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {points.length} tower{points.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Recenter on my GPS location — rendered last so it always stays on top and tappable */}
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

      {/* Legend */}
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
  map: { flex: 1, backgroundColor: '#050505' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,5,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
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
