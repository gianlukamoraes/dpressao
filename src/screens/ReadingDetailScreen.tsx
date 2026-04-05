import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BloodPressureReading } from '../types';
import { classifyBP, formatDate, formatTime } from '../utils/bloodPressure';
import { deleteReading } from '../storage/readings';
import { BPBadge } from '../components/BPBadge';
import { GlassBackground } from '../components/GlassBackground';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize } from '../theme';
import { RootStackParamList } from '../types/navigation';

type ReadingDetailRouteProps = RouteProp<RootStackParamList, 'ReadingDetail'>;

export function ReadingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ReadingDetailRouteProps>();
  const { colors, isLiquidGlass } = useTheme();
  const { reading } = route.params;
  const classification = classifyBP(reading.systolic, reading.diastolic);

  const CATEGORY_COLORS: Record<string, { color: string; bgColor: string }> = {
    normal:       { color: colors.normal,       bgColor: colors.normalBg },
    elevated:     { color: colors.elevated,     bgColor: colors.elevatedBg },
    hypertension1:{ color: colors.hypertension1,bgColor: colors.hypertension1Bg },
    hypertension2:{ color: colors.hypertension2,bgColor: colors.hypertension2Bg },
    crisis:       { color: colors.crisis,       bgColor: colors.crisisBg },
  };
  const cardColors = CATEGORY_COLORS[classification.category] ?? {
    color: classification.color,
    bgColor: classification.bgColor,
  };

  function handleDelete() {
    Alert.alert(
      'Excluir medição',
      'Tem certeza que deseja excluir esta medição? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteReading(reading.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  function handleEdit() {
    navigation.navigate('NewReading', { readingId: reading.id });
  }

  return (
    <GlassBackground>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        {/* Card principal */}
        <View style={[
          styles.mainCard,
          {
            backgroundColor: cardColors.bgColor,
            borderColor: isLiquidGlass ? cardColors.color + '55' : cardColors.color,
            borderWidth: isLiquidGlass ? 1 : 1.5,
            overflow: 'hidden',
          },
        ]}>
          {isLiquidGlass && <View style={styles.glassHighlight} />}
          <View style={styles.mainCardHeader}>
            <View>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatDate(reading.date)}</Text>
              <Text style={[styles.timeText, { color: colors.text }]}>{formatTime(reading.date)}</Text>
            </View>
            <BPBadge classification={classification} size="lg" />
          </View>

          <Text style={[styles.bpBig, { color: cardColors.color }]}>
            {reading.systolic}
            <Text style={[styles.bpSlash, { color: colors.textSecondary }]}>/</Text>
            {reading.diastolic}
            <Text style={[styles.bpUnit, { color: colors.textSecondary }]}> mmHg</Text>
          </Text>

          <Text style={[styles.classificationDescription, { color: cardColors.color }]}>
            {classification.description}
          </Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⬆️</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sistólica</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{reading.systolic}</Text>
              <Text style={[styles.statUnit, { color: colors.textMuted }]}>mmHg</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⬇️</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Diastólica</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{reading.diastolic}</Text>
              <Text style={[styles.statUnit, { color: colors.textMuted }]}>mmHg</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>💓</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pulso</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{reading.pulse}</Text>
              <Text style={[styles.statUnit, { color: colors.textMuted }]}>bpm</Text>
            </View>
          </View>
        </View>

        {/* Sintomas */}
        <View style={[styles.noteCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>🩺 Sintomas</Text>
          {reading.symptoms && reading.symptoms.length > 0 ? (
            <View style={styles.chipsRow}>
              {reading.symptoms.map((symptom) => (
                <View key={symptom} style={[styles.chip, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}>
                  <Text style={[styles.chipText, { color: colors.text }]}>{symptom}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noteEmpty, { color: colors.textMuted }]}>Nenhum sintoma registrado.</Text>
          )}
        </View>

        {/* Nota */}
        {reading.note ? (
          <View style={[styles.noteCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.noteLabel, { color: colors.textSecondary }]}>💬 Observação</Text>
            <Text style={[styles.noteText, { color: colors.text }]}>{reading.note}</Text>
          </View>
        ) : null}

        {/* Referência */}
        <View style={[styles.referenceCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.referenceTitle, { color: colors.textSecondary }]}>📊 Classificação</Text>
          {[
            { emoji: '🟢', label: 'Normal', value: '< 120/80', cat: 'normal' },
            { emoji: '🟡', label: 'Elevada', value: '120–129/< 80', cat: 'elevated' },
            { emoji: '🟠', label: 'Hipertensão 1', value: '130–139/80–89', cat: 'hypertension1' },
            { emoji: '🔴', label: 'Hipertensão 2', value: '≥ 140/≥ 90', cat: 'hypertension2' },
            { emoji: '🚨', label: 'Crise', value: '> 180/> 120', cat: 'crisis' },
          ].map((item) => (
            <View
              key={item.cat}
              style={[
                styles.referenceRow,
                item.cat === classification.category && { backgroundColor: colors.surfaceLight },
              ]}
            >
              <Text style={styles.referenceEmoji}>{item.emoji}</Text>
              <Text style={[
                styles.referenceLabel,
                { color: colors.textSecondary },
                item.cat === classification.category && { color: colors.text, fontWeight: '700' },
              ]}>
                {item.label}
              </Text>
              <Text style={[
                styles.referenceValue,
                { color: colors.textSecondary },
                item.cat === classification.category && { color: colors.text, fontWeight: '700' },
              ]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Botões */}
        <TouchableOpacity style={[styles.editButton, { borderColor: colors.primary }]} onPress={handleEdit} activeOpacity={0.8}>
          <Text style={[styles.editButtonText, { color: colors.primary }]}>✏️ Editar medição</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.deleteButton, { borderColor: colors.hypertension2 }]} onPress={handleDelete} activeOpacity={0.8}>
          <Text style={[styles.deleteButtonText, { color: colors.hypertension2 }]}>🗑️ Excluir medição</Text>
        </TouchableOpacity>
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
    zIndex: 1,
  },
  mainCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  timeText: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  bpBig: {
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 72,
  },
  bpSlash: {
    fontWeight: '300',
  },
  bpUnit: {
    fontSize: fontSize.md,
    fontWeight: '400',
  },
  classificationDescription: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  statUnit: {
    fontSize: fontSize.xs,
  },
  statDivider: {
    width: 1,
    height: 60,
  },
  noteCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  noteLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  noteText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  noteEmpty: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  referenceCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  referenceTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  referenceEmoji: {
    fontSize: fontSize.md,
    width: 22,
    textAlign: 'center',
  },
  referenceLabel: {
    flex: 1,
    fontSize: fontSize.sm,
  },
  referenceValue: {
    fontSize: fontSize.sm,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
