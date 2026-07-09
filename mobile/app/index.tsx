import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SimfinityLogo } from '../components/SimfinityLogo';
import { COLORS } from '../components/styles';
import { TOURIST_SPOTS } from '../data';
import { useApp } from '../context/AppContext';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const { authReady, isLoggedIn } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);

  // Entrance animation for content
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  // Auto-navigate once the session restore check completes
  useEffect(() => {
    if (!authReady) return;
    if (isLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [authReady, isLoggedIn]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // Sync postcard to the global background cycle (same 5s interval)
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % TOURIST_SPOTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const spot = TOURIST_SPOTS[currentIdx];

  // Hide entirely once logged in (router.replace fires in the effect above)
  if (isLoggedIn) return null;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.content,
            { opacity: contentOpacity, transform: [{ translateY: contentSlide }] },
          ]}
        >
          {/* Logo + tagline */}
          <View style={styles.logoSection}>
            <SimfinityLogo size={100} showText />
            <Text style={styles.tagline}>Global Connectivity with Local Soul</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>GHANA 5G TRAVELER eSIM COMPANION</Text>
            </View>
          </View>

          {/* Postcard showing current landmark (synced to bg) */}
          <View style={styles.postcard}>
            <Image
              source={{ uri: spot.imageUrl }}
              style={styles.postcardImage}
              resizeMode="cover"
            />
            <View style={styles.postcardGradient} />

            {/* Dot indicators */}
            <View style={styles.dots}>
              {TOURIST_SPOTS.map((_, i) => (
                <View key={i} style={[styles.dot, i === currentIdx && styles.dotActive]} />
              ))}
            </View>

            {/* Spot name + location */}
            <View style={styles.postcardInfo}>
              <View style={styles.postcardTag}>
                <Text style={styles.postcardTagText}>GHANA LANDMARK</Text>
              </View>
              <Text style={styles.postcardName}>{spot.name}</Text>
              <Text style={styles.postcardLocation}>{spot.location}</Text>
            </View>
          </View>

          {/* Bottom actions */}
          <View style={styles.bottomSection}>
            <View style={styles.kenteStripe} />

            <View style={styles.featureRow}>
              {['Instant Setup', '190+ Countries', 'Ghana Rooted'].map(label => (
                <View key={label} style={styles.featureChip}>
                  <Text style={styles.featureLabel}>{label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.replace('/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>Browse Without Account</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>ROOTED IN GHANA</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 28,
  },
  logoSection: {
    alignItems: 'center',
    gap: 8,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: '700',
  },
  badge: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    borderRadius: 20,
  },
  badgeText: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  postcard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: height * 0.22,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  postcardImage: {
    width: '100%',
    height: '100%',
  },
  postcardGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  dots: {
    position: 'absolute',
    top: 10,
    right: 12,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: COLORS.gold,
    width: 14,
  },
  postcardInfo: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    gap: 3,
  },
  postcardTag: {
    backgroundColor: 'rgba(255,215,0,0.95)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 3,
  },
  postcardTagText: {
    color: '#000',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1,
  },
  postcardName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  postcardLocation: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    fontWeight: '600',
  },
  bottomSection: {
    gap: 14,
  },
  kenteStripe: {
    height: 3,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    borderRadius: 8,
  },
  featureLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  primaryBtn: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.gold,
    fontWeight: '600',
    fontSize: 13,
  },
  footer: {
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'center',
  },
});
