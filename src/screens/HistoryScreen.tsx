import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BloodPressureReading } from '../types';
import { getReadings } from '../storage/readings';
import { classifyBP, formatDate } from '../utils/bloodPressure';
import { ReadingCard } from '../components/ReadingCard';
import { colors, spacing, borderRadius, fontSize } from '../theme';

type Filter = 'all' | 'normal' | 'elevated' | 'hypertension1' | 'hypertension2' | 'crisis';

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: 'all', label: 'Todas', emoji: '📋' },
  { key: 'normal', label: 'Normal', emoji: '🟢' },
  { key: 'elevated', label: 'Elevada', emoji: '🟡' },
  { key: 'hypertension1', label: 'Hiper 1', emoji: '🟠' },
  { key: 'hypertension2', label: 'Hiper 2', emoji: '🔴' },
  { key: 'crisis', label: 'Crise', emoji: '🚨' },
];

export function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  const loadReadings = useCallback(async () => {
    const data = await getReadings();
    setReadings(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReadings();
    }, [loadReadings])
  );

  const filteredReadings = readings.filter((r) => {
    if (filter === 'all') return true;
    const cls = classifyBP(r.systolic, r.diastolic);
    return cls.category === filter;
  });

  // Calcular médias
  const validReadings = readings.slice(0, 30);
  const avgSystolic =
    validReadings.length > 0
      ? Math.round(validReadings.reduce((s, r) => s + r.systolic, 0) / validReadings.length)
      : 0;
  const avgDiastolic =
    validReadings.length > 0
      ? Math.round(validReadings.reduce((s, r) => s + r.diastolic, 0) / validReadings.length)
      : 0;
  const avgPulse =
    validReadings.length > 0
      ? Math.round(validReadings.reduce((s, r) => s + r.pulse, 0) / validReadings.length)
      : 0;

  // Agrupar por data
  const grouped = filteredReadings.reduce<Record<string, BloodPressureReading[]>>((acc, r) => {
    const date = formatDate(r.date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});

  const groupedList = Object.entries(grouped);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <FlatList
        data={groupedList}
        keyExtractor={([date]) => date}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            {/* Resumo */}
            {readings.length > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  Média dos últimos {Math.min(readings.length, 30)} registros
                </Text>
                <View style={styles.summaryStats}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{avgSystolic}/{avgDiastolic}</Text>
                    <Text style={styles.summaryLabel}>mmHg</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{avgPulse}</Text>
                    <Text style={styles.summaryLabel}>bpm</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{readings.length}</Text>
                    <Text style={styles.summaryLabel}>medições</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Filtros */}
            <View style={styles.filtersWrapper}>
              <FlatList
                data={FILTERS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(f) => f.key}
                contentContainerStyle={styles.filters}
                renderItem={({ item: f }) => (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      styles.filterChip,
                      filter === f.key && styles.filterChipActive,
                    ]}
                    onPress={() => setFilter(f.key)}
                  >
                    <Text style={styles.filterEmoji}>{f.emoji}</Text>
                    <Text
                      style={[
                        styles.filterLabel,
                        filter === f.key && styles.filterLabelActive,
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </>
        }
        renderItem={({ item: [date, dayReadings] }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>
            {dayReadings.map((reading) => (
              <ReadingCard
                key={reading.id}
                reading={reading}
                onDelete={loadReadings}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Nenhuma medição encontrada</Text>
            <Text style={styles.emptyText}>
              {filter !== 'all'
                ? 'Nenhuma medição nesta categoria.'
                : 'Comece registrando sua primeira medição.'}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('NewReading')}
              >
                <Text style={styles.emptyButtonText}>➕ Nova Medição</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
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
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  summaryTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  filtersWrapper: {
    marginBottom: spacing.md,
  },
  filters: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterEmoji: {
    fontSize: fontSize.sm,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  dateGroup: {
    marginBottom: spacing.md,
  },
  dateHeader: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
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
  emptyButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
});
