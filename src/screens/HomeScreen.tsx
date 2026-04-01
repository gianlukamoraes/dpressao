import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BloodPressureReading, AppSettings } from '../types';
import { getReadings } from '../storage/readings';
import { getSettings } from '../storage/settings';
import {
  classifyBP,
  formatBP,
  formatDateTime,
  formatRelativeDate,
} from '../utils/bloodPressure';
import { BPBadge } from '../components/BPBadge';
import { ReadingCard } from '../components/ReadingCard';
import { colors, spacing, borderRadius, fontSize } from '../theme';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const loadReadings = useCallback(async () => {
    const data = await getReadings();
    const appSettings = await getSettings();
    setReadings(data);
    setSettings(appSettings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReadings();
    }, [loadReadings])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  }

  const latest = readings[0];
  const latestClassification = latest
    ? classifyBP(latest.systolic, latest.diastolic)
    : null;
  const recentReadings = readings.slice(1, 4);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Olá{settings?.userName ? ', ' + settings.userName : ''} 👋
          </Text>
          <Text style={styles.subtitle}>Monitoramento de pressão arterial</Text>
        </View>
        <View style={styles.heartIcon}>
          <Text style={{ fontSize: 28 }}>🫀</Text>
        </View>
      </View>

      {/* Última medição */}
      {latest && latestClassification ? (
        <TouchableOpacity
          style={[
            styles.latestCard,
            { borderColor: latestClassification.color, backgroundColor: latestClassification.bgColor },
          ]}
          onPress={() => navigation.navigate('ReadingDetail', { reading: latest })}
          activeOpacity={0.8}
        >
          <Text style={styles.latestLabel}>Última medição</Text>
          <Text style={styles.latestDate}>{formatRelativeDate(latest.date)} · {formatDateTime(latest.date).split(' às ')[1]}</Text>

          <View style={styles.latestBP}>
            <Text style={[styles.latestValue, { color: latestClassification.color }]}>
              {formatBP(latest.systolic, latest.diastolic)}
            </Text>
            <Text style={styles.latestUnit}>mmHg</Text>
          </View>

          <View style={styles.latestStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Sistólica</Text>
              <Text style={styles.statValue}>{latest.systolic}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Diastólica</Text>
              <Text style={styles.statValue}>{latest.diastolic}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pulso</Text>
              <Text style={styles.statValue}>{latest.pulse}</Text>
            </View>
          </View>

          <BPBadge classification={latestClassification} size="lg" />

          {latestClassification.description ? (
            <Text style={[styles.description, { color: latestClassification.color }]}>
              {latestClassification.description}
            </Text>
          ) : null}
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>🩺</Text>
          <Text style={styles.emptyTitle}>Nenhuma medição ainda</Text>
          <Text style={styles.emptyText}>
            Registre sua primeira medição de pressão arterial.
          </Text>
        </View>
      )}

      {/* Botão nova medição */}
      <TouchableOpacity
        style={styles.newButton}
        onPress={() => navigation.navigate('NewReading')}
        activeOpacity={0.85}
      >
        <Text style={styles.newButtonIcon}>➕</Text>
        <Text style={styles.newButtonText}>Nova Medição</Text>
      </TouchableOpacity>

      {/* Medições recentes */}
      {recentReadings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medições Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAll}>Ver tudo</Text>
            </TouchableOpacity>
          </View>
          {recentReadings.map((reading) => (
            <ReadingCard
              key={reading.id}
              reading={reading}
              onDelete={loadReadings}
            />
          ))}
        </View>
      )}

      {/* Referência rápida */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tabela de Referência</Text>
        <View style={styles.referenceCard}>
          {[
            { emoji: '🟢', label: 'Normal', value: '< 120/80' },
            { emoji: '🟡', label: 'Elevada', value: '120–129/< 80' },
            { emoji: '🟠', label: 'Hipertensão 1', value: '130–139/80–89' },
            { emoji: '🔴', label: 'Hipertensão 2', value: '≥ 140/≥ 90' },
            { emoji: '🚨', label: 'Crise', value: '> 180/> 120' },
          ].map((item, i) => (
            <View key={i} style={styles.referenceRow}>
              <Text style={styles.referenceEmoji}>{item.emoji}</Text>
              <Text style={styles.referenceLabel}>{item.label}</Text>
              <Text style={styles.referenceValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heartIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  latestCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1.5,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  latestLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  latestDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  latestBP: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  latestValue: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 60,
  },
  latestUnit: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  latestStats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  description: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  newButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  newButtonIcon: {
    fontSize: fontSize.lg,
  },
  newButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  referenceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  referenceEmoji: {
    fontSize: fontSize.md,
    width: 22,
    textAlign: 'center',
  },
  referenceLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  referenceValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
});
