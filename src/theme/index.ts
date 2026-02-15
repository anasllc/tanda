export { colors } from './colors';
export type { Colors } from './colors';

export {
  typography,
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing
} from './typography';
export type { Typography } from './typography';

export {
  spacing,
  borderRadius,
  iconSize,
  hitSlop,
  layout
} from './spacing';
export type {
  Spacing,
  BorderRadius,
  IconSize,
  Layout
} from './spacing';

// Animation timing (for programmatic use with Reanimated)
export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

// Reanimated spring presets
export const springPresets = {
  snappy: { damping: 20, stiffness: 300, mass: 0.8 },
  gentle: { damping: 15, stiffness: 150, mass: 1 },
  bouncy: { damping: 10, stiffness: 180, mass: 0.8 },
  press: { damping: 15, stiffness: 400, mass: 0.5 },
} as const;

// Reanimated timing presets (duration in ms)
export const timingPresets = {
  fast: { duration: 150 },
  normal: { duration: 250 },
  slow: { duration: 400 },
  entrance: { duration: 350 },
} as const;

// Spring configs for Reanimated (legacy compat)
export const springConfig = {
  gentle: { damping: 15, stiffness: 150 },
  bouncy: { damping: 10, stiffness: 180 },
  stiff: { damping: 20, stiffness: 300 },
  wobbly: { damping: 8, stiffness: 200 },
} as const;

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
  glow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  // Glow shadow presets for premium UI
  glowPrimary: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  glowPrimarySubtle: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  glowSuccess: {
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  cardFloat: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  buttonGlow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
