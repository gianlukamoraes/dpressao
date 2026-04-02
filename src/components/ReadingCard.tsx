import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BloodPressureReading } from '../types';
import { classifyBP, formatDate, formatTime } from '../utils/bloodPressure';
import { BPBadge } from './BPBadge';
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { deleteReading } from '../storage/readings';

interface Props {
  reading: BloodPressureReading;
  onDelete?: () => void;
  onPress?: () => void;
}

export function ReadingCard({ reading, onDelete, onPress }: Props) {
  const navigation = useNavigation<any>();
  const classification = classifyBP(reading.systolic, reading.diastolic);

  function handleDelete() {
    Alert.alert(
      'Excluir medição',
      'Tem certeza que deseja excluir esta medição?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteReading(reading.id);
            onDelete?.();
          },
        },
      ]
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: classification.color }]}
      onPress={onPress || (() => navigation.navigate('ReadingDetail', { reading }))}
      onLongPress={handleDelete}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <Text style={styles.bpValue}>
          {reading.systolic}
          <Text style={styles.bpSeparator}>/</Text>
          {reading.diastolic}
          <Text style={styles.bpUnit}> mmHg</Text>
        </Text>
        <View style={styles.meta}>
          <BPBadge classification={classification} size="sm" />
        </View>
        {reading.note ? (
          <Text style={styles.note} numberOfLines={1}>
            💬 {reading.note}
          </Text>
        ) : null}
      </View>

      <View style={styles.right}>
        <Text style={styles.date}>{formatDate(reading.date)}</Text>
        <Text style={styles.time}>{formatTime(reading.date)}</Text>
        <View style={styles.pulseRow}>
          <Text style={styles.pulseIcon}>💓</Text>
          <Text style={styles.pulse}>{reading.pulse} bpm</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  left: {
    flex: 1,
    gap: spacing.sm,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginLeft: spacing.lg,
  },
  bpValue: {
    fontSize: fontSize.xxxl,
    fontWeight: '900',
    color: colors.text,
    lineHeight: 44,
  },
  bpSeparator: {
    color: colors.textMuted,
    fontWeight: '300',
  },
  bpUnit: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '700',
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  note: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: fontSize.xxl,
    color: colors.text,
    fontWeight: '900',
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  pulseIcon: {
    fontSize: fontSize.lg,
  },
  pulse: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
