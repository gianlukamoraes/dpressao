import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme';

export function MedicalDisclaimer() {
  return (
    <View style={styles.container}>
      <View style={styles.iconAndText}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.bold}>Apenas para registro pessoal.</Text>
          <Text style={styles.text}>Não substitui consulta médica. Em emergência, procure um hospital.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.hypertension2,
    padding: spacing.md,
  },
  iconAndText: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  icon: {
    fontSize: fontSize.lg,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  bold: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.text,
  },
  text: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
