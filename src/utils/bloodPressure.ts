import { BPCategory, BPClassification } from '../types';
import { colors } from '../theme';

export function classifyBP(systolic: number, diastolic: number): BPClassification {
  if (systolic > 180 || diastolic > 120) {
    return {
      category: 'crisis',
      label: 'Crise Hipertensiva',
      color: colors.crisis,
      bgColor: colors.crisisBg,
      emoji: '🚨',
      description: 'Procure atendimento médico imediatamente!',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'hypertension2',
      label: 'Hipertensão Estágio 2',
      color: colors.hypertension2,
      bgColor: colors.hypertension2Bg,
      emoji: '🔴',
      description: 'Consulte seu médico em breve.',
    };
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return {
      category: 'hypertension1',
      label: 'Hipertensão Estágio 1',
      color: colors.hypertension1,
      bgColor: colors.hypertension1Bg,
      emoji: '🟠',
      description: 'Atenção: monitore com frequência.',
    };
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return {
      category: 'elevated',
      label: 'Pressão Elevada',
      color: colors.elevated,
      bgColor: colors.elevatedBg,
      emoji: '🟡',
      description: 'Acima do ideal. Fique atento.',
    };
  }
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
