import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from './styles';

const LAST_OPEN_KEY = 'simfinity_last_opened';
const ABSENCE_MS = 4 * 60 * 60 * 1000; // show after 4 hours away
const HOLD_MS = 2800;                   // auto-dismiss after this long

export function ReturnSplash() {
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    (async () => {
      const now = Date.now();
      const raw = await AsyncStorage.getItem(LAST_OPEN_KEY);
      await AsyncStorage.setItem(LAST_OPEN_KEY, String(now));

      // First ever launch — Expo's own splash already handles that
      if (!raw) return;

      const last = parseInt(raw, 10);
      if (now - last < ABSENCE_MS) return;

      setVisible(true);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 70,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(dismiss, HOLD_MS);
      return () => clearTimeout(timer);
    })();
  }, []);

  const dismiss = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 420,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Pressable style={styles.inner} onPress={dismiss}>
        <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
          <Text style={styles.line1}>Simfinity</Text>
          <Text style={styles.line2}>
            eSIM<Text style={styles.dot}>.</Text>
          </Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>Ghana's connection to the world.</Text>
        </Animated.View>

        <Text style={styles.hint}>Tap anywhere to continue</Text>
      </Pressable>
    </Animated.View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#080808',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: height * 0.04,
  },
  line1: {
    color: '#e8e3d8',
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  line2: {
    color: '#e8e3d8',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
    marginTop: -10,
  },
  dot: {
    color: COLORS.gold,
  },
  divider: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.gold,
    borderRadius: 1,
    marginTop: 20,
    opacity: 0.6,
  },
  tagline: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: 4,
  },
  hint: {
    position: 'absolute',
    bottom: 52,
    color: 'rgba(255,255,255,0.18)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
