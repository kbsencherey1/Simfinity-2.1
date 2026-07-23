import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from './styles';

interface Props {
  size?: number;
  showText?: boolean;
}

const logoAsset = require('../assets/logo.png');

export function SimfinityLogo({ size = 80, showText = false }: Props) {
  return (
    <View style={styles.wrapper}>
      <Image source={logoAsset} style={{ width: size, height: size * 0.452 }} resizeMode="contain" />
      {showText && (
        <Text style={styles.brandText}>SIMFINITY</Text>
      )}
    </View>
  );
}

export function SimfinityNavbarLogo({ size = 48 }: { size?: number }) {
  return (
    <View style={styles.navRow}>
      <Image source={logoAsset} style={{ width: size, height: size * 0.452 }} resizeMode="contain" />
      <Text style={[styles.navBrand, { fontSize: size * 0.28, letterSpacing: size * 0.042 }]}>SIMFINITY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 8,
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
    gap: 2,
  },
  navBrand: {
    color: COLORS.gold,
    fontWeight: '800',
  },
});
