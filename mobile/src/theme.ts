import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#ffffff',
  foreground: '#000000',
  muted: '#a1a1aa',
  mutedForeground: '#71717a',
  border: '#e4e4e7',
  red: '#dc2626',
  white: '#ffffff',
  black: '#000000',
};

export const EVENT_COLORS: Record<string, string> = {
  BIRTHDAY: '#ca8a04',
  DEATH: '#2563eb',
  MARRIAGE: '#db2777',
  MOVE: '#16a34a',
  OTHER: '#7c3aed',
};

export const FONT_FAMILY = 'Cinzel-Regular';

export const typography = StyleSheet.create({
  h1: {
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.foreground,
    letterSpacing: 1,
  },
  h2: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.foreground,
    letterSpacing: 0.5,
  },
  h3: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    color: COLORS.foreground,
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  small: {
    fontFamily: FONT_FAMILY,
    fontSize: 8,
    color: COLORS.muted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
