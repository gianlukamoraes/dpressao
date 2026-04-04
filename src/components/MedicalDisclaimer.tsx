import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, fontSize } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export function MedicalDisclaimer() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderLeftColor: colors.hypertension2 }]}>
      <View style={styles.iconAndText}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.bold, { color: colors.text }]}>Apenas para registro pessoal.</Text>
          <Text style={[styles.text, { color: colors.textMuted }]}>Não substitui consulta médica. Em emergência, procure um hospital.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
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
  },
  text: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});
