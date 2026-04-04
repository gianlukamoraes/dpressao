import React, { useCallback, useMemo, useState } from 'react';
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

function avg(arr: number[]): number {
  return arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
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

  const { filtered, previous, avgSys, avgDia, avgPul, minSys, maxSys, minDia, maxDia, distributions, insights, goal } = useMemo(() => {
    const filtered = filterByPeriod(readings, period);
    const previous = getPreviousPeriod(readings, period);

    const avgSys = avg(filtered.map((r) => r.systolic));
    const avgDia = avg(filtered.map((r) => r.diastolic));
    const avgPul = avg(filtered.map((r) => r.pulse));
    const minSys = filtered.length > 0 ? Math.min(...filtered.map((r) => r.systolic)) : 0;
    const maxSys = filtered.length > 0 ? Math.max(...filtered.map((r) => r.systolic)) : 0;
    const minDia = filtered.length > 0 ? Math.min(...filtered.map((r) => r.diastolic)) : 0;
    const maxDia = filtered.length > 0 ? Math.max(...filtered.map((r) => r.diastolic)) : 0;

    const distributions = { normal: 0, elevated: 0, hypertension1: 0, hypertension2: 0, crisis: 0 };
    filtered.forEach((r) => { distributions[classifyBP(r.systolic, r.diastolic).category]++; });

    const insights: InsightCard[] = [
      period !== Infinity ? calcTrendInsight(filtered, previous) : null,
      calcPeakHourInsight(filtered),
      calcSymptomCorrelation(filtered),
      calcVariabilityInsight(filtered),
      profile?.bpGoal ? calcGoalInsight(filtered, profile.bpGoal) : null,
    ].filter((i): i is InsightCard => i !== null);

    const goal = profile?.bpGoal ?? null;

    return { filtered, previous, avgSys, avgDia, avgPul, minSys, maxSys, minDia, maxDia, distributions, insights, goal };
  }, [readings, period, profile]);

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
              <View key={insight.title} style={[styles.insightCard, { borderLeftColor: accentColor }]}>
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
