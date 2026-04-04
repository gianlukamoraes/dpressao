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
        {
          backgroundColor: classification.bgColor,
          borderColor: classification.color,
        },
        isSmall && styles.badgeSm,
        isLarge && styles.badgeLg,
      ]}
    >
      <Text
        style={[
          styles.emoji,
          isSmall && styles.emojiSm,
          isLarge && styles.emojiLg,
        ]}
      >
        {classification.emoji}
      </Text>
      <View style={styles.labelContainer}>
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
    borderWidth: 1.5,
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeLg: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 2,
  },
  labelContainer: {
    justifyContent: 'center',
  },
  emoji: {
    fontSize: fontSize.lg,
  },
  emojiSm: {
    fontSize: fontSize.md,
  },
  emojiLg: {
    fontSize: fontSize.xl2,
  },
  label: {
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  labelSm: {
    fontSize: fontSize.sm,
  },
  labelLg: {
    fontSize: fontSize.lg,
  },
});
