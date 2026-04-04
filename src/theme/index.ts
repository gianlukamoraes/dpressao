// dPressão — Azul Ardósia + Verde Saúde
// Paleta: Fundo azul-ardósia suave, bordas cinza soft, ação principal verde saúde
// Vermelho reservado exclusivamente para ações destrutivas

export const colors = {
  // Ação principal — Verde Saúde
  primary: '#16A34A',
  primaryLight: '#22C55E',
  primaryDark: '#15803D',

  // Ações destrutivas — Vermelho (apenas excluir/cancelar)
  danger: '#DC3545',
  dangerLight: '#E07080',
  dangerDark: '#A02838',

  // Backgrounds & Surfaces — Azul Ardósia
  background: '#EEF2F7',
  surface: '#F8FAFC',
  surfaceLight: '#F1F5F9',
  border: '#E2E8F0',

  // Text hierarchy
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Accent
  accent: '#C9A961',
  accentLight: '#E8D4B8',

  // Status colors (sem alteração)
  normal: '#22C55E',
  normalBg: '#F0FDF4',
  elevated: '#FBBF24',
  elevatedBg: '#FFFBEB',
  hypertension1: '#FB923C',
  hypertension1Bg: '#FEF3C7',
  hypertension2: '#EF4444',
  hypertension2Bg: '#FEE2E2',
  crisis: '#A855F7',
  crisisBg: '#F3E8FF',

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
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
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

// DARK MODE THEME
export const colorsDark = {
  primary: '#16A34A',
  primaryLight: '#22C55E',
  primaryDark: '#15803D',
  danger: '#DC3545',
  dangerLight: '#E07080',
  dangerDark: '#A02838',
  background: '#0A0F0A',
  surface: '#111814',
  surfaceLight: '#1A2A1A',
  border: '#2A3A2A',
  text: '#F0FDF4',
  textSecondary: '#86EFAC',
  textMuted: '#4ADE80',
  accent: '#C9A961',
  accentLight: '#E8D4B8',
  normal: '#22C55E',
  normalBg: '#0F2912',
  elevated: '#FBBF24',
  elevatedBg: '#1F1A05',
  hypertension1: '#FB923C',
  hypertension1Bg: '#1F1305',
  hypertension2: '#EF4444',
  hypertension2Bg: '#2D0B0B',
  crisis: '#A855F7',
  crisisBg: '#2D1F47',
  overlay: 'rgba(255,255,255,0.5)',
};
