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
        <Text
          style={styles.bpValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
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
    borderWidth: 1.5,
    borderColor: colors.border,
    borderLeftWidth: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  left: {
    flex: 1,
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingLeft: spacing.md,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
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
    fontSize: fontSize.xl2,
    color: colors.text,
    fontWeight: '900',
    lineHeight: 28,
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  pulseIcon: {
    fontSize: fontSize.md,
  },
  pulse: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '700',
  },
});
