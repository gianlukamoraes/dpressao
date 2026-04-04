import { BloodPressureReading } from '../types';

export interface InsightCard {
  icon: string;
  title: string;
  value: string;
  description: string;
  status: 'good' | 'warning' | 'alert' | 'neutral';
}

const MIN_READINGS = 3;

export function calcTrendInsight(
  current: BloodPressureReading[],
  previous: BloodPressureReading[]
): InsightCard | null {
  if (current.length < MIN_READINGS || previous.length < MIN_READINGS) return null;

  const avgCurrent = Math.round(
    current.reduce((s, r) => s + r.systolic, 0) / current.length
  );
  const avgPrevious = Math.round(
    previous.reduce((s, r) => s + r.systolic, 0) / previous.length
  );
  const delta = avgCurrent - avgPrevious;

  if (Math.abs(delta) <= 2) {
    return {
      icon: '→',
      title: 'Tendência Sistólica',
      value: 'Estável',
      description: `Média de ${avgCurrent} mmHg, sem variação significativa vs período anterior`,
      status: 'neutral',
    };
  }

  const sign = delta > 0 ? '↑' : '↓';
  const absDelta = Math.abs(delta);

  return {
    icon: sign,
    title: 'Tendência Sistólica',
    value: `${sign} ${absDelta} mmHg`,
    description: `Média de ${avgCurrent} mmHg vs ${avgPrevious} mmHg no período anterior`,
    status: delta > 0 ? 'alert' : 'good',
  };
}

export function calcPeakHourInsight(
  readings: BloodPressureReading[]
): InsightCard | null {
  if (readings.length < MIN_READINGS) return null;

  const shifts: Record<string, { sum: number; count: number; label: string }> = {
    morning:   { sum: 0, count: 0, label: 'manhã (6h–12h)' },
    afternoon: { sum: 0, count: 0, label: 'tarde (12h–18h)' },
    evening:   { sum: 0, count: 0, label: 'noite (18h–24h)' },
    night:     { sum: 0, count: 0, label: 'madrugada (0h–6h)' },
  };

  readings.forEach((r) => {
    const hour = new Date(r.date).getHours();
    const key =
      hour >= 6 && hour < 12 ? 'morning'
      : hour >= 12 && hour < 18 ? 'afternoon'
      : hour >= 18 ? 'evening'
      : 'night';
    shifts[key].sum += r.systolic;
    shifts[key].count++;
  });

  const active = Object.values(shifts).filter((s) => s.count >= 1);
  if (active.length < 2) return null;

  const peak = active.reduce((a, b) =>
    a.sum / a.count > b.sum / b.count ? a : b
  );
  const peakAvg = Math.round(peak.sum / peak.count);

  return {
    icon: '🕐',
    title: 'Horário de Pico',
    value: peak.label.split(' ')[0].charAt(0).toUpperCase() + peak.label.split(' ')[0].slice(1),
    description: `Medições mais altas pela ${peak.label} — média de ${peakAvg} mmHg`,
    status: peakAvg >= 140 ? 'alert' : peakAvg >= 130 ? 'warning' : 'neutral',
  };
}

export function calcSymptomCorrelation(
  readings: BloodPressureReading[]
): InsightCard | null {
  const withSymptoms = readings.filter(
    (r) => r.symptoms && r.symptoms.length > 0
  );
  if (withSymptoms.length === 0) return null;

  const symptomTotal: Record<string, number> = {};
  const symptomHigh: Record<string, number> = {};

  readings.forEach((r) => {
    (r.symptoms ?? []).forEach((s) => {
      if (s === 'Sem sintomas') return;
      symptomTotal[s] = (symptomTotal[s] ?? 0) + 1;
      if (r.systolic >= 130) {
        symptomHigh[s] = (symptomHigh[s] ?? 0) + 1;
      }
    });
  });

  let bestSymptom = '';
  let bestPct = 0;

  Object.keys(symptomTotal).forEach((s) => {
    if (symptomTotal[s] < 2) return;
    const pct = ((symptomHigh[s] ?? 0) / symptomTotal[s]) * 100;
    if (pct > bestPct) {
      bestPct = pct;
      bestSymptom = s;
    }
  });

  if (!bestSymptom || bestPct < 50) return null;

  return {
    icon: '🩺',
    title: 'Sintoma Frequente',
    value: `${Math.round(bestPct)}%`,
    description: `"${bestSymptom}" em ${Math.round(bestPct)}% das medições acima de 130 mmHg`,
    status: bestPct >= 75 ? 'alert' : 'warning',
  };
}

export function calcVariabilityInsight(
  readings: BloodPressureReading[]
): InsightCard | null {
  if (readings.length < MIN_READINGS) return null;

  const values = readings.map((r) => r.systolic);
  const range = Math.max(...values) - Math.min(...values);

  if (range <= 20) {
    return {
      icon: '📊',
      title: 'Variabilidade',
      value: `Estável (${range} mmHg)`,
      description: `Variação de ${range} mmHg — pressão controlada no período`,
      status: 'good',
    };
  }
  if (range <= 35) {
    return {
      icon: '📊',
      title: 'Variabilidade',
      value: `Moderada (${range} mmHg)`,
      description: `Variação de ${range} mmHg — alguma instabilidade detectada`,
      status: 'warning',
    };
  }
  return {
    icon: '📊',
    title: 'Variabilidade',
    value: `Alta (${range} mmHg)`,
    description: `Variação de ${range} mmHg — pressão instável no período`,
    status: 'alert',
  };
}

export function calcGoalInsight(
  readings: BloodPressureReading[],
  goal: { systolic: number; diastolic: number }
): InsightCard | null {
  if (readings.length < MIN_READINGS) return null;

  const within = readings.filter(
    (r) => r.systolic <= goal.systolic && r.diastolic <= goal.diastolic
  ).length;
  const pct = Math.round((within / readings.length) * 100);

  return {
    icon: '🎯',
    title: 'Meta Atingida',
    value: `${pct}%`,
    description: `${pct}% das medições dentro da meta (${goal.systolic}/${goal.diastolic} mmHg)`,
    status: pct >= 70 ? 'good' : pct >= 40 ? 'warning' : 'alert',
  };
}
