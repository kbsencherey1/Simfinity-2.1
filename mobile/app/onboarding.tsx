import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../components/styles';
import { useApp } from '../context/AppContext';

export const ONBOARDING_SEEN_KEY = '@simfinity_has_seen_onboarding_v2';

const { width } = Dimensions.get('window');

type Slide = {
  id: string;
  imageUrl: string;
  headlineKey: string;
  subtextKey: string;
};

const SLIDES: Slide[] = [
  {
    id: 'compare',
    imageUrl: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
    headlineKey: 'onboarding.slide1Headline',
    subtextKey: 'onboarding.slide1Subtext',
  },
  {
    id: 'instant',
    imageUrl: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=1200&q=80',
    headlineKey: 'onboarding.slide2Headline',
    subtextKey: 'onboarding.slide2Subtext',
  },
  {
    id: 'roaming',
    imageUrl: 'https://images.unsplash.com/photo-1763455892848-39bbc7ca90a0?auto=format&fit=crop&w=1200&q=80',
    headlineKey: 'onboarding.slide3Headline',
    subtextKey: 'onboarding.slide3Subtext',
  },
  {
    id: 'gift',
    imageUrl: 'https://images.unsplash.com/photo-1625552187571-7ee60ac43d2b?auto=format&fit=crop&w=1200&q=80',
    headlineKey: 'onboarding.slide4Headline',
    subtextKey: 'onboarding.slide4Subtext',
  },
];

export default function OnboardingScreen() {
  const { t } = useApp();
  const [index, setIndex] = useState(0);
  const listRef = useRef<Animated.FlatList<Slide>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const finish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    } catch {
      // ignore — worst case they see onboarding again next launch
    }
    router.replace('/login');
  };

  const handleNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          {!isLast ? (
            <Pressable onPress={finish} hitSlop={12} style={({ pressed }) => pressed && { opacity: 0.6 }}>
              <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
            </Pressable>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>

        <Animated.FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={s => s.id}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={styles.illustration}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.illustrationImg}
                  resizeMode="cover"
                  fadeDuration={0}
                />
                <View style={styles.illustrationOverlay} />
              </View>
              <Text style={styles.headline}>{t(item.headlineKey)}</Text>
              <Text style={styles.subtext}>{t(item.subtextKey)}</Text>
            </View>
          )}
        />

        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 22, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });
            return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />;
          })}
        </View>

        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}
          onPress={handleNext}
        >
          <Text style={styles.primaryBtnText}>{isLast ? t('onboarding.getStarted') : t('onboarding.next')}</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    height: 40,
  },
  skipPlaceholder: { width: 1, height: 1 },
  skipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },

  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  illustration: {
    width: '100%',
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
    marginBottom: 32,
  },
  illustrationImg: {
    width: '100%',
    height: '100%',
  },
  illustrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  headline: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtext: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },

  primaryBtn: {
    backgroundColor: COLORS.gold,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnPressed: { backgroundColor: COLORS.goldHover, transform: [{ scale: 0.98 }] },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },
});
