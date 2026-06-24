import { StyleSheet } from 'react-native';

export const COLORS = {
  gold: '#ffd700',
  goldHover: '#e6c200',
  terracotta: '#cc4e3c',
  terracottaDark: '#891d11',
  ghanaGreen: '#006b3f',
  greenLight: '#94ecb4',
  charcoal: '#121212',
  surface: '#131313',
  clay: '#201f1f',
  clayHigh: '#2a2a2a',
  white: '#ffffff',
  text: '#e5e2e1',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
  border: 'rgba(77, 71, 50, 0.3)',
  goldBorder: 'rgba(255, 215, 0, 0.08)',
  goldBorderMid: 'rgba(255, 215, 0, 0.3)',
};

export const glass = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(19, 19, 19, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 16,
  },
  input: {
    backgroundColor: 'rgba(32, 31, 31, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(153, 144, 119, 0.25)',
    borderRadius: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});

export const kenteDivider = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: 'rgba(255, 215, 0, 0.35)',
    marginVertical: 16,
  },
});
