# Tendências Revamp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o gráfico SVG customizado por react-native-gifted-charts com 3 linhas + meta, adicionar 5 insights automáticos baseados em regras e unificar as estatísticas em um card com barras de distribuição.

**Architecture:** Três camadas independentes — (1) `insights.ts` com funções puras de cálculo, (2) `BPLineChart.tsx` reescrito com gifted-charts, (3) `TrendScreen.tsx` orquestrado que consome ambos. O TrendScreen também carrega `UserProfile` para obter `bpGoal`.

**Tech Stack:** React Native + TypeScript + Expo + react-native-gifted-charts + react-native-svg (já instalado)

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `src/utils/insights.ts` | Criar | Funções puras: calcTrendInsight, calcPeakHourInsight, calcSymptomCorrelation, calcVariabilityInsight, calcGoalInsight |
| `src/components/BPLineChart.tsx` | Substituir | Gráfico com gifted-charts: 3 linhas, toggles, linha de meta, tooltip |
| `src/screens/TrendScreen.tsx` | Modificar | Integra BPLineChart, insights, stats unificadas; carrega profile |

---

## Task 1: Instalar react-native-gifted-charts

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Instalar a biblioteca**

```bash
cd C:/Github/dpressao && npx expo install react-native-gifted-charts
```

Saída esperada: `+ react-native-gifted-charts@x.x.x` sem erros.

- [ ] **Verificar instalação**

```bash
grep "gifted-charts" C:/Github/dpressao/package.json
```

Saída esperada: linha com `"react-native-gifted-charts": "..."`.

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add package.json package-lock.json && git commit -m "chore: instalar react-native-gifted-charts"
```

---

## Task 2: Criar src/utils/insights.ts

**Files:**
- Create: `src/utils/insights.ts`

- [ ] **Criar o arquivo com tipos e todas as funções**

Criar `src/utils/insights.ts` com o seguinte conteúdo completo:

```typescript
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
```

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/utils/insights.ts && git commit -m "feat: funções de insights automáticos (tendência, horário, sintoma, variabilidade, meta)"
```

---

## Task 3: Reescrever src/components/BPLineChart.tsx

**Files:**
- Modify: `src/components/BPLineChart.tsx`

- [ ] **Substituir o componente inteiro**

Reescrever `src/components/BPLineChart.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { BloodPressureReading } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface BPLineChartProps {
  readings: BloodPressureReading[];
  showSystolic?: boolean;
  showDiastolic?: boolean;
  showPulse?: boolean;
  goalSystolic?: number;
  goalDiastolic?: number;
}

export function BPLineChart({
  readings,
  showSystolic = true,
  showDiastolic = true,
  showPulse = true,
  goalSystolic,
  goalDiastolic,
}: BPLineChartProps) {
  const { width } = useWindowDimensions();
  const chartWidth = width - spacing.lg * 4;

  if (readings.length === 0) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>Sem dados para exibir</Text>
      </View>
    );
  }

  // Chart: oldest → newest (left to right)
  const sorted = [...readings].reverse();

  const labelStep = Math.max(1, Math.floor(sorted.length / 5));

  const makeData = (getValue: (r: BloodPressureReading) => number) =>
    sorted.map((r, i) => ({
      value: getValue(r),
      label:
        i % labelStep === 0
          ? new Date(r.date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            })
          : '',
    }));

  const systolicData = makeData((r) => r.systolic);
  const diastolicData = makeData((r) => r.diastolic);
  const pulseData = makeData((r) => r.pulse);

  const TRANSPARENT = 'transparent';

  return (
    <View style={styles.container}>
      <LineChart
        data={systolicData}
        data2={diastolicData}
        data3={pulseData}
        color={showSystolic ? colors.hypertension2 : TRANSPARENT}
        color2={showDiastolic ? colors.primary : TRANSPARENT}
        color3={showPulse ? colors.normal : TRANSPARENT}
        thickness={2}
        thickness2={2}
        thickness3={2}
        dataPointsColor={showSystolic ? colors.hypertension2 : TRANSPARENT}
        dataPointsColor2={showDiastolic ? colors.primary : TRANSPARENT}
        dataPointsColor3={showPulse ? colors.normal : TRANSPARENT}
        dataPointsRadius={4}
        hideDataPoints={!showSystolic}
        hideDataPoints2={!showDiastolic}
        hideDataPoints3={!showPulse}
        width={chartWidth}
        height={220}
        curved
        initialSpacing={8}
        endSpacing={8}
        yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
        yAxisColor={colors.border}
        xAxisColor={colors.border}
        rulesColor={colors.border}
        rulesType="solid"
        referenceLine1={!!goalSystolic}
        referenceLine1Position={goalSystolic ?? 0}
        referenceLine1Config={{
          color: colors.hypertension2,
          dashWidth: 5,
          dashGap: 5,
          thickness: 1,
          opacity: 0.6,
          labelText: goalSystolic ? `Meta ${goalSystolic}` : '',
          labelTextStyle: { color: colors.hypertension2, fontSize: 9 },
        }}
        referenceLine2={!!goalDiastolic}
        referenceLine2Position={goalDiastolic ?? 0}
        referenceLine2Config={{
          color: colors.primary,
          dashWidth: 5,
          dashGap: 5,
          thickness: 1,
          opacity: 0.6,
          labelText: goalDiastolic ? `Meta ${goalDiastolic}` : '',
          labelTextStyle: { color: colors.primary, fontSize: 9 },
        }}
        pointerConfig={{
          pointerStripHeight: 200,
          pointerStripColor: colors.border,
          pointerStripWidth: 1,
          pointerColor: colors.textSecondary,
          radius: 5,
          pointerLabelWidth: 120,
          pointerLabelHeight: 72,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: { value: number }[]) => {
            const sys = items[0]?.value;
            const dia = items[1]?.value;
            const pul = items[2]?.value;
            return (
              <View style={styles.tooltip}>
                {showSystolic && sys !== undefined && (
                  <Text style={[styles.tooltipLine, { color: colors.hypertension2 }]}>
                    SIS: {sys} mmHg
                  </Text>
                )}
                {showDiastolic && dia !== undefined && (
                  <Text style={[styles.tooltipLine, { color: colors.primary }]}>
                    DIA: {dia} mmHg
                  </Text>
                )}
                {showPulse && pul !== undefined && (
                  <Text style={[styles.tooltipLine, { color: colors.normal }]}>
                    PUL: {pul} bpm
                  </Text>
                )}
              </View>
            );
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  empty: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  tooltip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  tooltipLine: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
```

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/components/BPLineChart.tsx && git commit -m "feat: BPLineChart com gifted-charts (3 linhas, toggles, meta, tooltip)"
```

---

## Task 4: Reescrever src/screens/TrendScreen.tsx

**Files:**
- Modify: `src/screens/TrendScreen.tsx`

- [ ] **Substituir o arquivo inteiro**

Reescrever `src/screens/TrendScreen.tsx`:

```typescript
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BloodPressureReading, UserProfile } from '../types';
import { getReadings } from '../storage/readings';
import { getProfile } from '../storage/user';
import { classifyBP } from '../utils/bloodPressure';
import { BPLineChart } from '../components/BPLineChart';
import {
  InsightCard,
  calcTrendInsight,
  calcPeakHourInsight,
  calcSymptomCorrelation,
  calcVariabilityInsight,
  calcGoalInsight,
} from '../utils/insights';
import { colors, spacing, borderRadius, fontSize } from '../theme';

type TimePeriod = 7 | 30 | 90 | typeof Infinity;

const PERIOD_OPTIONS: { label: string; value: TimePeriod }[] = [
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: 'Tudo', value: Infinity },
];

const CATEGORY_CONFIG = [
  { key: 'normal',        label: 'Normal',       emoji: '🟢', color: colors.normal },
  { key: 'elevated',      label: 'Elevada',      emoji: '🟡', color: colors.elevated },
  { key: 'hypertension1', label: 'Hiper 1',      emoji: '🟠', color: colors.hypertension1 },
  { key: 'hypertension2', label: 'Hiper 2',      emoji: '🔴', color: colors.hypertension2 },
  { key: 'crisis',        label: 'Crise',        emoji: '🚨', color: colors.crisis },
] as const;

const STATUS_COLORS: Record<InsightCard['status'], string> = {
  good:    colors.normal,
  warning: colors.elevated,
  alert:   colors.hypertension2,
  neutral: colors.textSecondary,
};

function filterByPeriod(readings: BloodPressureReading[], period: TimePeriod): BloodPressureReading[] {
  if (period === Infinity) return readings;
  const cutoff = Date.now() - period * 24 * 60 * 60 * 1000;
  return readings.filter((r) => new Date(r.date).getTime() >= cutoff);
}

function getPreviousPeriod(readings: BloodPressureReading[], period: TimePeriod): BloodPressureReading[] {
  if (period === Infinity) return [];
  const now = Date.now();
  const periodMs = period * 24 * 60 * 60 * 1000;
  return readings.filter((r) => {
    const t = new Date(r.date).getTime();
    return t >= now - 2 * periodMs && t < now - periodMs;
  });
}

export function TrendScreen() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [period, setPeriod] = useState<TimePeriod>(30);
  const [showSystolic, setShowSystolic] = useState(true);
  const [showDiastolic, setShowDiastolic] = useState(true);
  const [showPulse, setShowPulse] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [data, prof] = await Promise.all([getReadings(), getProfile()]);
        setReadings(data);
        setProfile(prof);
      }
      load();
    }, [])
  );

  const filtered = filterByPeriod(readings, period);
  const previous = getPreviousPeriod(readings, period);

  // Statistics
  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const avgSys = avg(filtered.map((r) => r.systolic));
  const avgDia = avg(filtered.map((r) => r.diastolic));
  const avgPul = avg(filtered.map((r) => r.pulse));
  const minSys = filtered.length > 0 ? Math.min(...filtered.map((r) => r.systolic)) : 0;
  const maxSys = filtered.length > 0 ? Math.max(...filtered.map((r) => r.systolic)) : 0;
  const minDia = filtered.length > 0 ? Math.min(...filtered.map((r) => r.diastolic)) : 0;
  const maxDia = filtered.length > 0 ? Math.max(...filtered.map((r) => r.diastolic)) : 0;

  const distributions = { normal: 0, elevated: 0, hypertension1: 0, hypertension2: 0, crisis: 0 };
  filtered.forEach((r) => { distributions[classifyBP(r.systolic, r.diastolic).category]++; });

  // Insights
  const insights: InsightCard[] = [
    period !== Infinity ? calcTrendInsight(filtered, previous) : null,
    calcPeakHourInsight(filtered),
    calcSymptomCorrelation(filtered),
    calcVariabilityInsight(filtered),
    profile?.bpGoal ? calcGoalInsight(filtered, profile.bpGoal) : null,
  ].filter((i): i is InsightCard => i !== null);

  const goal = profile?.bpGoal ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>📊 Tendências</Text>
        <Text style={styles.subtitle}>Análise de padrões de pressão arterial</Text>
      </View>

      {/* Seletor de período */}
      <View style={styles.periodRow}>
        {PERIOD_OPTIONS.map(({ label, value }) => (
          <TouchableOpacity
            key={label}
            style={[styles.periodBtn, period === value && styles.periodBtnActive]}
            onPress={() => setPeriod(value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.periodBtnText, period === value && styles.periodBtnTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Gráfico */}
      <BPLineChart
        readings={filtered}
        showSystolic={showSystolic}
        showDiastolic={showDiastolic}
        showPulse={showPulse}
        goalSystolic={goal?.systolic}
        goalDiastolic={goal?.diastolic}
      />

      {/* Toggles de linha */}
      <View style={styles.toggleRow}>
        {[
          { label: 'SIS', active: showSystolic, color: colors.hypertension2, onPress: () => setShowSystolic((v) => !v) },
          { label: 'DIA', active: showDiastolic, color: colors.primary, onPress: () => setShowDiastolic((v) => !v) },
          { label: 'PULSO', active: showPulse, color: colors.normal, onPress: () => setShowPulse((v) => !v) },
        ].map(({ label, active, color, onPress }) => (
          <TouchableOpacity
            key={label}
            style={[styles.toggleBtn, active && { borderColor: color, backgroundColor: color + '22' }]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.toggleDot, { backgroundColor: active ? color : colors.border }]} />
            <Text style={[styles.toggleText, active && { color }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Insights */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Insights</Text>
          {insights.map((insight, i) => {
            const accentColor = STATUS_COLORS[insight.status];
            return (
              <View key={i} style={[styles.insightCard, { borderLeftColor: accentColor }]}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>{insight.icon}</Text>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={[styles.insightValue, { color: accentColor }]}>{insight.value}</Text>
                </View>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Estatísticas */}
      {filtered.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Estatísticas do Período</Text>
          <View style={styles.statsCard}>

            {/* Médias */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avgSys}/{avgDia}</Text>
                <Text style={styles.statLabel}>mmHg médio</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{avgPul}</Text>
                <Text style={styles.statLabel}>bpm médio</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{filtered.length}</Text>
                <Text style={styles.statLabel}>{filtered.length === 1 ? 'medição' : 'medições'}</Text>
              </View>
            </View>

            <View style={styles.statsSeparator} />

            {/* Intervalo */}
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Sistólica</Text>
              <Text style={styles.rangeValue}>{minSys} – {maxSys} mmHg</Text>
            </View>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>Diastólica</Text>
              <Text style={styles.rangeValue}>{minDia} – {maxDia} mmHg</Text>
            </View>

            <View style={styles.statsSeparator} />

            {/* Distribuição com barras */}
            <Text style={styles.distTitle}>Distribuição</Text>
            {CATEGORY_CONFIG.map(({ key, label, emoji, color }) => {
              const count = distributions[key];
              const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
              return (
                <View key={key} style={styles.distRow}>
                  <Text style={styles.distEmoji}>{emoji}</Text>
                  <Text style={styles.distLabel}>{label}</Text>
                  <View style={styles.distBarTrack}>
                    <View style={[styles.distBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.distCount}>{count}</Text>
                  <Text style={styles.distPct}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>Sem dados neste período</Text>
          <Text style={styles.emptyText}>Registre mais medições para ver tendências.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  header: { marginBottom: spacing.sm },
  title: { fontSize: fontSize.xxxl, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },

  periodRow: { flexDirection: 'row', gap: spacing.sm },
  periodBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, alignItems: 'center',
  },
  periodBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  periodBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textSecondary },
  periodBtnTextActive: { color: colors.text, fontWeight: '900' },

  toggleRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleDot: { width: 8, height: 8, borderRadius: 4 },
  toggleText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted },

  section: { gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.md, fontWeight: '900', color: colors.text, textTransform: 'uppercase', letterSpacing: 1.5 },

  insightCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, borderLeftWidth: 4, gap: spacing.xs,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  insightIcon: { fontSize: fontSize.md, width: 22, textAlign: 'center' },
  insightTitle: { flex: 1, fontSize: fontSize.sm, fontWeight: '700', color: colors.textSecondary },
  insightValue: { fontSize: fontSize.md, fontWeight: '900' },
  insightDescription: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 16 },

  statsCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, gap: spacing.sm },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: fontSize.xl, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '600' },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border },
  statsSeparator: { height: 1, backgroundColor: colors.border },

  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rangeLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  rangeValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },

  distTitle: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  distEmoji: { fontSize: fontSize.sm, width: 16, textAlign: 'center' },
  distLabel: { width: 60, fontSize: fontSize.xs, color: colors.textSecondary },
  distBarTrack: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  distBarFill: { height: '100%', borderRadius: 4 },
  distCount: { width: 20, fontSize: fontSize.xs, fontWeight: '700', color: colors.text, textAlign: 'right' },
  distPct: { width: 32, fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'right' },

  empty: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: 'center' },
});
```

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/screens/TrendScreen.tsx && git commit -m "feat: TrendScreen revamp — insights automáticos, stats unificadas, toggles de linha"
```

---

## Task 5: Verificação Manual

- [ ] Abrir o app e navegar para a aba Tendências — gráfico deve renderizar sem erros
- [ ] Tocar num ponto do gráfico — tooltip deve aparecer com SIS/DIA/PUL
- [ ] Clicar nos botões SIS / DIA / PULSO — linhas devem aparecer/desaparecer
- [ ] Trocar o período (7d / 30d / 90d / Tudo) — dados devem filtrar
- [ ] Definir meta no Perfil Clínico (ex: 130/80) — linhas tracejadas aparecem no gráfico + card "Meta Atingida" nos insights
- [ ] Registrar medições com sintomas — card "Sintoma Frequente" deve aparecer nos insights
- [ ] Verificar barras de distribuição — proporcionais às contagens de cada categoria
- [ ] Com poucos dados (< 3 medições) — seção de insights deve estar vazia/oculta
