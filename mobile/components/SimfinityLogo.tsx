import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from './styles';

interface Props {
  size?: number;
  showText?: boolean;
}

export function SimfinityLogo({ size = 60, showText = false }: Props) {
  const ringSize = size;
  const innerSize = size * 0.55;
  const dotSize = size * 0.14;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.outerRing, { width: ringSize, height: ringSize, borderRadius: ringSize / 2 }]}>
        <View style={[styles.innerCircle, { width: innerSize, height: innerSize, borderRadius: innerSize / 2 }]}>
          <View style={[styles.dot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />
        </View>
      </View>
      {showText && (
        <Text style={styles.brandText}>SIMFINITY</Text>
      )}
    </View>
  );
}

export function SimfinityNavbarLogo({ size = 28 }: { size?: number }) {
  return (
    <View style={styles.navRow}>
      <View style={[styles.navRing, { width: size, height: size, borderRadius: size / 2 }]}>
        <View style={[styles.navInner, { width: size * 0.55, height: size * 0.55, borderRadius: size * 0.275 }]} />
      </View>
      <Text style={styles.navBrand}>SIMFINITY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 8,
  },
  outerRing: {
    borderWidth: 3,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: COLORS.surface,
  },
  brandText: {
    color: COLORS.gold,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navRing: {
    borderWidth: 2,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navInner: {
    backgroundColor: COLORS.gold,
  },
  navBrand: {
    color: COLORS.gold,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 2,
  },
});
