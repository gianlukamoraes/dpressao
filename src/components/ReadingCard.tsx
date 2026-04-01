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
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    marginBottom: spacing.sm,
  },
  left: {
    flex: 1,
    gap: spacing.xs,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  bpValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  bpSeparator: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  bpUnit: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  note: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  time: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '700',
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  pulseIcon: {
    fontSize: fontSize.sm,
  },
  pulse: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
