import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View, Dimensions } from 'react-native';
import { TOURIST_SPOTS } from '../data';

const { width, height } = Dimensions.get('window');

interface TouristBgCtx {
  opacities: Animated.Value[];
  loadedCount: number;
}

const Ctx = createContext<TouristBgCtx | null>(null);

export function TouristBackgroundProvider({ children }: { children: React.ReactNode }) {
  const opacities = useRef(
    TOURIST_SPOTS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  ).current;
  // Only the first photo loads at startup; the rest are fetched one at a time,
  // well after launch, so they don't compete with the app's own startup
  // network calls (session restore, eSIMs, payments, exchange rates, etc).
  const [loadedCount, setLoadedCount] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const prefetchRest = async () => {
      for (let i = 1; i < TOURIST_SPOTS.length; i++) {
        if (cancelled) return;
        await Image.prefetch(TOURIST_SPOTS[i].imageUrl).catch(() => {});
        if (!cancelled) setLoadedCount(c => Math.max(c, i + 1));
      }
    };
    const prefetchStart = setTimeout(prefetchRest, 3000);

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

    return () => { cancelled = true; clearTimeout(prefetchStart); clearInterval(timer); };
  }, [opacities]);

  return <Ctx.Provider value={{ opacities, loadedCount }}>{children}</Ctx.Provider>;
}

// Pure display component — reads from shared context, so all instances stay in sync
export function TouristBackground() {
  const ctx = useContext(Ctx);
  if (!ctx) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.base]} pointerEvents="none">
      {TOURIST_SPOTS.slice(0, ctx.loadedCount).map((s, i) => (
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
