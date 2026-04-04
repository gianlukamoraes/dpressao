import { BPCategory, BPClassification } from '../types';
import { colors } from '../theme';

export function classifyBP(systolic: number, diastolic: number): BPClassification {
  // Crise Hipertensiva — SBC 2020: ≥ 180 sistólica OU ≥ 110 diastólica
  if (systolic >= 180 || diastolic >= 110) {
    return {
      category: 'crisis',
      label: 'Crise Hipertensiva',
      color: colors.crisis,
      bgColor: colors.crisisBg,
      emoji: '🚨',
      description: 'Procure atendimento médico imediatamente!',
    };
  }
  // Hipertensão Estágio 2 — SBC 2020: 160–179 OU 100–109
  if (systolic >= 160 || diastolic >= 100) {
    return {
      category: 'hypertension2',
      label: 'Hipertensão Estágio 2',
      color: colors.hypertension2,
      bgColor: colors.hypertension2Bg,
      emoji: '🔴',
      description: 'Consulte seu médico em breve.',
    };
  }
  // Hipertensão Estágio 1 — SBC 2020: 140–159 OU 90–99
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'hypertension1',
      label: 'Hipertensão Estágio 1',
      color: colors.hypertension1,
      bgColor: colors.hypertension1Bg,
      emoji: '🟠',
      description: 'Atenção: monitore com frequência.',
    };
  }
  // Limítrofe — SBC 2020: 130–139 OU 85–89
  if (systolic >= 130 || diastolic >= 85) {
    return {
      category: 'elevated',
      label: 'Pressão Elevada',
      color: colors.elevated,
      bgColor: colors.elevatedBg,
      emoji: '🟡',
      description: 'Acima do ideal. Fique atento.',
    };
  }
  // Ótima e Normal — SBC 2020: < 130 E < 85 (inclui 120/80)
  return {
    category: 'normal',
    label: 'Normal',
    color: colors.normal,
    bgColor: colors.normalBg,
    emoji: '🟢',
    description: 'Pressão arterial ideal. Continue assim!',
  };
}

export function formatBP(systolic: number, diastolic: number): string {
  return `${systolic}/${diastolic}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)} às ${formatTime(isoString)}`;
}

export function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return formatDate(isoString);
}
