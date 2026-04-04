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
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { RootStackParamList } from '../types/navigation';

type ReadingDetailRouteProps = RouteProp<RootStackParamList, 'ReadingDetail'>;

export function ReadingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ReadingDetailRouteProps>();
  const { reading } = route.params;
  const classification = classifyBP(reading.systolic, reading.diastolic);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Card principal */}
      <View style={[styles.mainCard, { borderColor: classification.color, backgroundColor: classification.bgColor }]}>
        <View style={styles.mainCardHeader}>
          <View>
            <Text style={styles.dateText}>{formatDate(reading.date)}</Text>
            <Text style={styles.timeText}>{formatTime(reading.date)}</Text>
          </View>
          <BPBadge classification={classification} size="lg" />
        </View>

        <Text style={[styles.bpBig, { color: classification.color }]}>
          {reading.systolic}
          <Text style={styles.bpSlash}>/</Text>
          {reading.diastolic}
          <Text style={styles.bpUnit}> mmHg</Text>
        </Text>

        <Text style={[styles.classificationDescription, { color: classification.color }]}>
          {classification.description}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⬆️</Text>
            <Text style={styles.statLabel}>Sistólica</Text>
            <Text style={styles.statValue}>{reading.systolic}</Text>
            <Text style={styles.statUnit}>mmHg</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⬇️</Text>
            <Text style={styles.statLabel}>Diastólica</Text>
            <Text style={styles.statValue}>{reading.diastolic}</Text>
            <Text style={styles.statUnit}>mmHg</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💓</Text>
            <Text style={styles.statLabel}>Pulso</Text>
            <Text style={styles.statValue}>{reading.pulse}</Text>
            <Text style={styles.statUnit}>bpm</Text>
          </View>
        </View>
      </View>

      {/* Sintomas */}
      <View style={styles.noteCard}>
        <Text style={styles.noteLabel}>🩺 Sintomas</Text>
        {reading.symptoms && reading.symptoms.length > 0 ? (
          <View style={styles.chipsRow}>
            {reading.symptoms.map((symptom) => (
              <View key={symptom} style={styles.chip}>
                <Text style={styles.chipText}>{symptom}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noteEmpty}>Nenhum sintoma registrado.</Text>
        )}
      </View>

      {/* Nota */}
      {reading.note ? (
        <View style={styles.noteCard}>
          <Text style={styles.noteLabel}>💬 Observação</Text>
          <Text style={styles.noteText}>{reading.note}</Text>
        </View>
      ) : null}

      {/* Referência */}
      <View style={styles.referenceCard}>
        <Text style={styles.referenceTitle}>📊 Classificação</Text>
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
              item.cat === classification.category && styles.referenceRowActive,
            ]}
          >
            <Text style={styles.referenceEmoji}>{item.emoji}</Text>
            <Text style={[
              styles.referenceLabel,
              item.cat === classification.category && styles.referenceLabelActive,
            ]}>
              {item.label}
            </Text>
            <Text style={[
              styles.referenceValue,
              item.cat === classification.category && styles.referenceLabelActive,
            ]}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Botões */}
      <TouchableOpacity style={styles.editButton} onPress={handleEdit} activeOpacity={0.8}>
        <Text style={styles.editButtonText}>✏️ Editar medição</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
        <Text style={styles.deleteButtonText}>🗑️ Excluir medição</Text>
      </TouchableOpacity>
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
    gap: spacing.md,
  },
  mainCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
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
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timeText: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  bpBig: {
    fontSize: 64,
    fontWeight: '800',
    lineHeight: 72,
  },
  bpSlash: {
    fontWeight: '300',
    color: colors.textSecondary,
  },
  bpUnit: {
    fontSize: fontSize.md,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  classificationDescription: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: colors.surface,
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
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  statUnit: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.border,
  },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  noteLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  noteText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  noteEmpty: {
    fontSize: fontSize.md,
    color: colors.textMuted,
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
    backgroundColor: colors.surfaceLight,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  referenceCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  referenceTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
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
  referenceRowActive: {
    backgroundColor: colors.surfaceLight,
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
  referenceLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  referenceValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.hypertension2,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteButtonText: {
    color: colors.hypertension2,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
