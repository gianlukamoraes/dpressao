// HONEST DATA: Brutalist Medical + Warmth
// Tipografia: Serif bold (títulos) + Monospace (dados) + Sans moderno (corpo)
// Cores: Medical palette + Gold accent + Black contrast
// Composição: Bold numbers, asymmetric layout, generous whitespace

export const colors = {
  // Primary medical red (warmth)
  primary: '#DC3545',       // Mais warm que antes
  primaryLight: '#E07080',
  primaryDark: '#A02838',

  // Backgrounds & Surfaces
  background: '#FAFAF8',    // Off-white (não branco puro)
  surface: '#FFFFFF',       // Pure white para cards
  surfaceLight: '#F5F5F3',  // Subtle gray
  border: '#000000',        // Black solid borders (brutalist)

  // Text hierarchy
  text: '#1A1A1A',          // Near-black (não pure white)
  textSecondary: '#5A5A5A', // Medium gray
  textMuted: '#888888',     // Light gray

  // Accent: Warm gold
  accent: '#C9A961',        // Gold para highlights
  accentLight: '#E8D4B8',

  // Status colors (medical palette - kept vibrant)
  normal: '#22C55E',        // Bright green
  normalBg: '#F0FDF4',
  elevated: '#FBBF24',      // Amber
  elevatedBg: '#FFFBEB',
  hypertension1: '#FB923C', // Orange
  hypertension1Bg: '#FEF3C7',
  hypertension2: '#EF4444', // Red
  hypertension2Bg: '#FEE2E2',
  crisis: '#A855F7',        // Purple
  crisisBg: '#F3E8FF',

  // Utility
  overlay: 'rgba(0,0,0,0.5)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  huge: 64,
};

export const borderRadius = {
  sm: 2,      // More square/brutalist
  md: 4,
  lg: 8,
  xl: 12,
  full: 999,
};

export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xl2: 24,
  xxl: 32,    // Headlines
  xxxl: 48,   // Big numbers
  giant: 64,  // Huge numbers for BP
};
