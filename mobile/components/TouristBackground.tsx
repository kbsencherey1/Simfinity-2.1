import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View, Dimensions } from 'react-native';
import { TOURIST_SPOTS } from '../data';

const { width, height } = Dimensions.get('window');

interface TouristBgCtx {
  opacities: Animated.Value[];
}

const Ctx = createContext<TouristBgCtx | null>(null);

export function TouristBackgroundProvider({ children }: { children: React.ReactNode }) {
  const opacities = useRef(
    TOURIST_SPOTS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  ).current;

  useEffect(() => {
    // Preload every image into React Native's cache immediately on app start
    TOURIST_SPOTS.forEach(s => Image.prefetch(s.imageUrl).catch(() => {}));

    let idx = 0;
    const timer = setInterval(() => {
      const next = (idx + 1) % TOURIST_SPOTS.length;
      // Fade next in first, then fade current out — no gap between images
      Animated.sequence([
        Animated.timing(opacities[next], { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacities[idx], { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
      idx = next;
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return <Ctx.Provider value={{ opacities }}>{children}</Ctx.Provider>;
}

// Pure display component — reads from shared context, so all instances stay in sync
export function TouristBackground() {
  const ctx = useContext(Ctx);
  if (!ctx) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.base]} pointerEvents="none">
      {TOURIST_SPOTS.map((s, i) => (
        <Animated.View key={s.id} style={[StyleSheet.absoluteFill, { opacity: ctx.opacities[i] }]}>
          <Image
            source={{ uri: s.imageUrl }}
            style={styles.img}
            resizeMode="cover"
            fadeDuration={0}
          />
        </Animated.View>
      ))}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: '#0d0d0d' },
  img: { width, height },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 5, 0.42)',
  },
});
