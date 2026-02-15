export const colors = {
  // Primary - Purple accent
  primary: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Backgrounds
  background: {
    primary: '#050506',
    secondary: '#0F0F12',
    tertiary: '#18181D',
    elevated: '#1F1F25',
    card: '#131316',
    sheet: '#1A1A20',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    inverse: '#0A0A0B',
    muted: '#52525B',
  },

  // Borders
  border: {
    default: '#27272A',
    light: '#3F3F46',
    focus: '#8B5CF6',
  },

  // Status colors
  success: {
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
    background: 'rgba(34, 197, 94, 0.1)',
  },

  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    background: 'rgba(245, 158, 11, 0.1)',
  },

  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    background: 'rgba(239, 68, 68, 0.1)',
  },

  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    background: 'rgba(59, 130, 246, 0.1)',
  },

  // Network colors (Nigerian mobile networks)
  networks: {
    mtn: '#FFCC00',
    airtel: '#E20010',
    glo: '#00AA00',
    '9mobile': '#006E31',
  },

  // Utility
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',

  // Overlay
  overlay: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(0, 0, 0, 0.5)',
    heavy: 'rgba(0, 0, 0, 0.8)',
  },

  // Gradients (for LinearGradient props - can't be Tailwind classes)
  gradients: {
    primary: ['#7C3AED', '#5B21B6'] as const,
    balanceCard: ['#7C3AED', '#5B21B6', '#2E1065'] as const,
    welcome: ['#050506', '#130D1E', '#050506'] as const,
    success: ['#22C55E', '#16A34A'] as const,
    glow: ['#8B5CF640', '#8B5CF600'] as const,
    card: ['#151518', '#0F0F12'] as const,
  },
} as const;

export type Colors = typeof colors;
