import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SimfinityLogo } from '../components/SimfinityLogo';
import { COLORS } from '../components/styles';
import { HERITAGE_IMAGES } from '../data';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <ImageBackground
        source={{ uri: HERITAGE_IMAGES.landscapeAccra }}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoSection}>
            <SimfinityLogo size={100} showText />
            <Text style={styles.tagline}>Global Connectivity with Local Soul</Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.kenteStripe} />

            <View style={styles.featureRow}>
              {[
                { icon: '⚡', label: 'Instant Setup' },
                { icon: '🌍', label: '190+ Countries' },
                { icon: '🇬🇭', label: 'Ghana Rooted' },
              ].map(f => (
                <View key={f.label} style={styles.featureItem}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.replace('/login')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Get Started →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>Browse Without Account</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>❤  ROOTED IN GHANA</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  logoSection: {
    alignItems: 'center',
    gap: 12,
  },
  tagline: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: '700',
  },
  bottomSection: {
    gap: 16,
  },
  kenteStripe: {
    height: 3,
    backgroundColor: COLORS.gold,
    borderRadius: 2,
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  featureItem: {
    alignItems: 'center',
    gap: 4,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
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
    borderColor: 'rgba(255, 215, 0, 0.3)',
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
