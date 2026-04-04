import { colors as classicColors } from './index';

export const liquidGlassColors = {
  // Ação principal (igual ao clássico)
  primary: '#16A34A',
  primaryLight: '#22C55E',
  primaryDark: '#15803D',

  // Ações destrutivas (igual ao clássico)
  danger: '#DC3545',
  dangerLight: '#E07080',
  dangerDark: '#A02838',

  // Backgrounds & Surfaces — Carmim Escuro
  background: '#1C0A0A',
  surface: 'rgba(255,255,255,0.10)',
  surfaceLight: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.20)',

  // Halo vermelho (usado no GlassBackground)
  haloColor: 'rgba(220,38,38,0.35)',

  // Text hierarchy
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.40)',

  // Accent (igual ao clássico)
  accent: '#C9A961',
  accentLight: '#E8D4B8',

  // Status colors — inalterados (significado médico)
  normal: '#22C55E',
  normalBg: 'rgba(34,197,94,0.15)',
  elevated: '#FBBF24',
  elevatedBg: 'rgba(251,191,36,0.15)',
  hypertension1: '#FB923C',
  hypertension1Bg: 'rgba(249,115,22,0.15)',
  hypertension2: '#EF4444',
  hypertension2Bg: 'rgba(239,68,68,0.15)',
  crisis: '#A855F7',
  crisisBg: 'rgba(168,85,247,0.15)',

  overlay: 'rgba(0,0,0,0.6)',
} as const;

// Verificação de shape em compile-time
type _ShapeCheck = {
  [K in keyof typeof classicColors]: typeof liquidGlassColors[K extends keyof typeof liquidGlassColors ? K : never];
};
