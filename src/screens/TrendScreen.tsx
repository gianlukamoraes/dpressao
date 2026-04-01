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
import { BloodPressureReading } from '../types';
import { getReadings } from '../storage/readings';
import { classifyBP } from '../utils/bloodPressure';
import { BPLineChart } from '../components/BPLineChart';
import { colors, spacing, borderRadius, fontSize } from '../theme';

type TimePeriod = 7 | 30 | 90 | Infinity;

export function TrendScreen() {
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [period, setPeriod] = useState<TimePeriod>(30);

  const loadReadings = useCallback(async () => {
    const data = await getReadings();
    setReadings(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReadings();
    }, [loadReadings])
  );

  // Filter readings by time period
  const now = new Date().getTime();
  const filteredReadings = readings.filter((r) => {
    if (period === Infinity) return true;
    const readingTime = new Date(r.date).getTime();
    const daysAgo = (now - readingTime) / (1000 * 60 * 60 * 24);
    return daysAgo <= period;
  });

  // Calculate statistics
  const validReadings = filteredReadings.length > 0 ? filteredReadings : readings;
  const avgSystolic =
    validReadings.length > 0
      ? Math.round(validReadings.reduce((sum, r) => sum + r.systolic, 0) / validReadings.length)
      : 0;
  const avgDiastolic =
    validReadings.length > 0
      ? Math.round(validReadings.reduce((sum, r) => sum + r.diastolic, 0) / validReadings.length)
      : 0;
  const avgPulse =
    validReadings.length > 0
      ? Math.round(validReadings.reduce((sum, r) => sum + r.pulse, 0) / validReadings.length)
      : 0;

  const minSystolic =
    validReadings.length > 0 ? Math.min(...validReadings.map((r) => r.systolic)) : 0;
  const maxSystolic =
    validReadings.length > 0 ? Math.max(...validReadings.map((r) => r.systolic)) : 0;
  const minDiastolic =
    validReadings.length > 0 ? Math.min(...validReadings.map((r) => r.diastolic)) : 0;
  const maxDiastolic =
    validReadings.length > 0 ? Math.max(...validReadings.map((r) => r.diastolic)) : 0;

  // Classification distribution
  const classifications = {
    normal: 0,
    elevated: 0,
    hypertension1: 0,
    hypertension2: 0,
    crisis: 0,
  };

  filteredReadings.forEach((r) => {
    const cls = classifyBP(r.systolic, r.diastolic);
    classifications[cls.category]++;
  });

  const PeriodButton = ({ label, value }: { label: string; value: TimePeriod }) => (
    <TouchableOpacity
      style={[styles.periodButton, period === value && styles.periodButtonActive]}
      onPress={() => setPeriod(value)}
      activeOpacity={0.7}
    >
      <Text style={[styles.periodButtonText, period === value && styles.periodButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📊 Tendências</Text>
        <Text style={styles.subtitle}>Análise de padrões de pressão arterial</Text>
      </View>

      {/* Time period selector */}
      <View style={styles.periodSelector}>
        <PeriodButton label="7 dias" value={7} />
        <PeriodButton label="30 dias" value={30} />
        <PeriodButton label="90 dias" value={90} />
        <PeriodButton label="Tudo" value={Infinity} />
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <BPLineChart readings={filteredReadings} height={300} width={100} />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.hypertension2 }]} />
          <Text style={styles.legendLabel}>Sistólica</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendLabel}>Diastólica</Text>
        </View>
      </View>

      {/* Statistics */}
      {filteredReadings.length > 0 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Médias</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{avgSystolic}/{avgDiastolic}</Text>
                <Text style={styles.statLabel}>mmHg</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{avgPulse}</Text>
                <Text style={styles.statLabel}>bpm</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔍 Min / Máx</Text>
            <View style={styles.rangeCard}>
              <View style={styles.rangeRow}>
                <Text style={styles.rangeLabel}>Sistólica</Text>
                <Text style={styles.rangeValue}>
                  {minSystolic} - {maxSystolic}
                </Text>
              </View>
              <View style={[styles.rangeRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm }]}>
                <Text style={styles.rangeLabel}>Diastólica</Text>
                <Text style={styles.rangeValue}>
                  {minDiastolic} - {maxDiastolic}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Distribuição</Text>
            <View style={styles.distributionCard}>
              {[
                { emoji: '🟢', label: 'Normal', count: classifications.normal },
                { emoji: '🟡', label: 'Elevada', count: classifications.elevated },
                { emoji: '🟠', label: 'Hipertensão 1', count: classifications.hypertension1 },
                { emoji: '🔴', label: 'Hipertensão 2', count: classifications.hypertension2 },
                { emoji: '🚨', label: 'Crise', count: classifications.crisis },
              ].map((item) => (
                <View key={item.label} style={styles.distributionRow}>
                  <Text style={styles.distributionEmoji}>{item.emoji}</Text>
                  <Text style={styles.distributionLabel}>{item.label}</Text>
                  <Text style={styles.distributionCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {filteredReadings.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyTitle}>Sem dados neste período</Text>
          <Text style={styles.emptyText}>
            Registre mais medições para ver tendências.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodButtonTextActive: {
    color: colors.text,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rangeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rangeValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  distributionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  distributionEmoji: {
    fontSize: fontSize.md,
    width: 20,
    textAlign: 'center',
  },
  distributionLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  distributionCount: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
