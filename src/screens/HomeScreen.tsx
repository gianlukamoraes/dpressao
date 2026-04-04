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
import { BloodPressureReading, UserProfile } from '../types';
import { getReadings } from '../storage/readings';
import { getProfile } from '../storage/user';
import {
  classifyBP,
  formatDateTime,
  formatRelativeDate,
} from '../utils/bloodPressure';
import { BPBadge } from '../components/BPBadge';
import { ReadingCard } from '../components/ReadingCard';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';
import { GlassBackground } from '../components/GlassBackground';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize } from '../theme';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { colors, isLiquidGlass } = useTheme();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const REFERENCE_ITEMS = [
    { label: 'Normal', value: '< 130/< 85', color: colors.normal },
    { label: 'Elevada', value: '130–139/85–89', color: colors.elevated },
    { label: 'Hipertensão 1', value: '140–159/90–99', color: colors.hypertension1 },
    { label: 'Hipertensão 2', value: '160–179/100–109', color: colors.hypertension2 },
    { label: 'Crise', value: '≥ 180/≥ 110', color: colors.crisis },
  ];

  const loadReadings = useCallback(async () => {
    const [data, userProfile] = await Promise.all([getReadings(), getProfile()]);
    setReadings(data);
    setProfile(userProfile);
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

  // Mapeia categoria → cores do tema ativo (para o card principal)
  const CATEGORY_COLORS: Record<string, { color: string; bgColor: string }> = {
    normal: { color: colors.normal, bgColor: colors.normalBg },
    elevated: { color: colors.elevated, bgColor: colors.elevatedBg },
    hypertension1: { color: colors.hypertension1, bgColor: colors.hypertension1Bg },
    hypertension2: { color: colors.hypertension2, bgColor: colors.hypertension2Bg },
    crisis: { color: colors.crisis, bgColor: colors.crisisBg },
  };
  const cardColors = latestClassification
    ? (CATEGORY_COLORS[latestClassification.category] ?? { color: latestClassification.color, bgColor: latestClassification.bgColor })
    : null;

  return (
    <GlassBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}
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
            <Text style={[styles.greeting, { color: colors.text }]}>
              Olá{profile?.name ? ', ' + profile.name : ''}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Monitoramento de pressão arterial</Text>
          </View>
        </View>

        {/* Última medição */}
        {latest && latestClassification && cardColors ? (
          <TouchableOpacity
            style={[
              styles.latestCard,
              {
                backgroundColor: cardColors.bgColor,
                borderColor: isLiquidGlass ? cardColors.color + '55' : cardColors.color,
                borderWidth: isLiquidGlass ? 1 : 2,
                overflow: 'hidden',
              },
            ]}
            onPress={() => navigation.navigate('ReadingDetail', { reading: latest })}
            activeOpacity={0.8}
          >
            {isLiquidGlass && <View style={styles.glassHighlight} />}
            <View style={styles.latestCardContent}>
              {/* Header row */}
              <View style={styles.latestHeader}>
                <Text style={[styles.latestLabel, { color: colors.textMuted }]}>ÚLTIMA MEDIÇÃO</Text>
                <Text style={[styles.latestDate, { color: colors.textSecondary }]}>
                  {formatRelativeDate(latest.date)} · {formatDateTime(latest.date).split(' às ')[1]}
                </Text>
              </View>

              {/* Main BP value */}
              <View style={styles.latestBP}>
                <Text
                  style={[styles.latestValue, { color: cardColors.color }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  {latest.systolic}/{latest.diastolic}
                </Text>
                <Text style={[styles.latestUnit, { color: colors.textMuted }]}>mmHg</Text>
              </View>

              {/* Status badge */}
              <BPBadge classification={latestClassification} size="md" />

              {/* Só pulso — sem repetir SIS/DIA */}
              <View style={[
                styles.pulseRow,
                isLiquidGlass && { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.12)' },
              ]}>
                <Text style={styles.pulseIcon}>💓</Text>
                <Text style={[styles.pulseValue, { color: colors.text }]}>{latest.pulse}</Text>
                <Text style={[styles.pulseUnit, { color: colors.textMuted }]}>bpm</Text>
              </View>

              {latestClassification.description ? (
                <Text style={[styles.description, { color: cardColors.color }]}>
                  {latestClassification.description}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>🩺</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma medição ainda</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Registre sua primeira medição de pressão arterial.
            </Text>
          </View>
        )}

        {/* Botão nova medição */}
        <TouchableOpacity
          style={[styles.newButton, { backgroundColor: colors.primary }]}
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Medições Recentes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>Ver tudo</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tabela de Referência</Text>
          <View style={[styles.referenceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {REFERENCE_ITEMS.map((item, i) => (
              <View
                key={i}
                style={[
                  styles.referenceRow,
                  i < REFERENCE_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.surfaceLight },
                ]}
              >
                <View style={[styles.referenceDot, { backgroundColor: item.color }]} />
                <Text style={[styles.referenceLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.referenceValue, { color: item.color }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Medical Disclaimer Footer */}
        <MedicalDisclaimer />
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
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
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    marginTop: spacing.xs,
    fontWeight: '400',
  },
  // ── Glass highlight (specular, LG only) ───────────────────────
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
    zIndex: 1,
  },

  // ── Latest card ────────────────────────────────────────────────
  latestCard: {
    borderRadius: borderRadius.md,
    borderWidth: 2,
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
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  latestDate: {
    fontSize: fontSize.xs,
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
    flex: 1,
  },
  latestUnit: {
    fontSize: fontSize.sm,
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
  },
  pulseUnit: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  description: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },

  // ── Empty state ────────────────────────────────────────────────
  emptyCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
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
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },

  // ── Nova Medição button ────────────────────────────────────────
  newButton: {
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
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },

  // ── Reference table ────────────────────────────────────────────
  referenceCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
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
  referenceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  referenceLabel: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  referenceValue: {
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
});
