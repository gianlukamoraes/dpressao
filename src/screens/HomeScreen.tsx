import React, { useCallback, useEffect, useState } from 'react';
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
  formatDateTime,
  formatRelativeDate,
} from '../utils/bloodPressure';
import { BPBadge } from '../components/BPBadge';
import { ReadingCard } from '../components/ReadingCard';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import { colors, spacing, borderRadius, fontSize } from '../theme';

const REFERENCE_ITEMS = [
  { label: 'Normal', value: '< 130/< 85', color: colors.normal },
  { label: 'Elevada', value: '130–139/85–89', color: colors.elevated },
  { label: 'Hipertensão 1', value: '140–159/90–99', color: colors.hypertension1 },
  { label: 'Hipertensão 2', value: '160–179/100–109', color: colors.hypertension2 },
  { label: 'Crise', value: '≥ 180/≥ 110', color: colors.crisis },
];

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

  // Garante refresh ao voltar de modal (iOS não dispara useFocusEffect em alguns casos)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadReadings);
    return unsubscribe;
  }, [navigation, loadReadings]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadReadings();
    setRefreshing(false);
  }

  const latest = readings[0];
  const latestClassification = latest
    ? classifyBP(latest.systolic, latest.diastolic)
    : null;
  const recentReadings = readings.slice(0, 3);

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
            Olá{settings?.userName ? ', ' + settings.userName : ''}
          </Text>
          <Text style={styles.subtitle}>Monitoramento de pressão arterial</Text>
        </View>
      </View>

      {/* Última medição */}
      {latest && latestClassification ? (
        <TouchableOpacity
          style={[
            styles.latestCard,
            {
              borderColor: latestClassification.color,
              backgroundColor: latestClassification.bgColor,
            },
          ]}
          onPress={() => navigation.navigate('ReadingDetail', { reading: latest })}
          activeOpacity={0.8}
        >
          <View style={styles.latestCardContent}>
            {/* Header row */}
            <View style={styles.latestHeader}>
              <Text style={styles.latestLabel}>ÚLTIMA MEDIÇÃO</Text>
              <Text style={styles.latestDate}>
                {formatRelativeDate(latest.date)} · {formatDateTime(latest.date).split(' às ')[1]}
              </Text>
            </View>

            {/* Main BP value */}
            <View style={styles.latestBP}>
              <Text
                style={[styles.latestValue, { color: latestClassification.color }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                {latest.systolic}/{latest.diastolic}
              </Text>
              <Text style={styles.latestUnit}>mmHg</Text>
            </View>

            {/* Status badge */}
            <BPBadge classification={latestClassification} size="md" />

            {/* Só pulso — sem repetir SIS/DIA */}
            <View style={styles.pulseRow}>
              <Text style={styles.pulseIcon}>💓</Text>
              <Text style={styles.pulseValue}>{latest.pulse}</Text>
              <Text style={styles.pulseUnit}>bpm</Text>
            </View>

            {latestClassification.description ? (
              <Text style={[styles.description, { color: latestClassification.color }]}>
                {latestClassification.description}
              </Text>
            ) : null}
          </View>
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
          {REFERENCE_ITEMS.map((item, i) => (
            <View
              key={i}
              style={[
                styles.referenceRow,
                i < REFERENCE_ITEMS.length - 1 && styles.referenceRowBorder,
              ]}
            >
              <View style={[styles.referenceDot, { backgroundColor: item.color }]} />
              <Text style={styles.referenceLabel}>{item.label}</Text>
              <Text style={[styles.referenceValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Medical Disclaimer Footer */}
      <MedicalDisclaimer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '400',
  },
  // ── Latest card ────────────────────────────────────────────────
  latestCard: {
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  latestCardContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  latestLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  latestDate: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  latestBP: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  latestValue: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.text,
    flex: 1,
  },
  latestUnit: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: '600',
  },

  // ── Pulse row ──────────────────────────────────────────────────
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingVertical: spacing.sm,
  },
  pulseIcon: {
    fontSize: fontSize.lg,
  },
  pulseValue: {
    fontSize: fontSize.xl2,
    fontWeight: '900',
    color: colors.text,
  },
  pulseUnit: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },

  // ── Empty state ────────────────────────────────────────────────
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: fontSize.xl2,
    fontWeight: '900',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ── Nova Medição button ────────────────────────────────────────
  newButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  newButtonIcon: {
    fontSize: fontSize.xl,
  },
  newButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // ── Sections ───────────────────────────────────────────────────
  section: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl2,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '700',
  },

  // ── Reference table ────────────────────────────────────────────
  referenceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  referenceRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  referenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  referenceLabel: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  referenceValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});
