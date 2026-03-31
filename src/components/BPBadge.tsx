import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BPClassification } from '../types';
import { borderRadius, fontSize, spacing } from '../theme';

interface Props {
  classification: BPClassification;
  size?: 'sm' | 'md' | 'lg';
}

export function BPBadge({ classification, size = 'md' }: Props) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: classification.bgColor, borderColor: classification.color },
        isSmall && styles.badgeSm,
        isLarge && styles.badgeLg,
      ]}
    >
      <Text style={[styles.emoji, isSmall && styles.emojiSm, isLarge && styles.emojiLg]}>
        {classification.emoji}
      </Text>
      <Text
        style={[
          styles.label,
          { color: classification.color },
          isSmall && styles.labelSm,
          isLarge && styles.labelLg,
        ]}
      >
        {classification.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeLg: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  emoji: {
    fontSize: fontSize.md,
  },
  emojiSm: {
    fontSize: fontSize.sm,
  },
  emojiLg: {
    fontSize: fontSize.xl,
  },
  label: {
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  labelSm: {
    fontSize: fontSize.xs,
  },
  labelLg: {
    fontSize: fontSize.lg,
  },
});
