import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  // ── Headings ────────────────────────────────────────────────────────
  h1: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  h4: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.neutral[700],
  },

  // ── Body ────────────────────────────────────────────────────────────
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    color: colors.neutral[700],
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.neutral[600],
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.neutral[500],
    lineHeight: 18,
  },

  // ── Labels & Captions ──────────────────────────────────────────────
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[400],
  },

  // ── Buttons ─────────────────────────────────────────────────────────
  buttonLarge: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonMedium: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Tabbar ──────────────────────────────────────────────────────────
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;
