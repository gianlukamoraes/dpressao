import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme';

interface DisclaimerScreenProps {
  onAccept: () => void;
}

export function DisclaimerScreen({ onAccept }: DisclaimerScreenProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚠️</Text>
        <Text style={styles.headerTitle}>Aviso de Saúde Importante</Text>
      </View>

      {/* Medical Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>Isenção de Responsabilidade Médica</Text>

        <View style={styles.disclaimerContent}>
          <Text style={styles.disclaimerText}>
            <Text style={styles.bold}>Este aplicativo é apenas para registro pessoal.</Text> Ele não substitui consulta médica profissional, diagnóstico ou tratamento.
          </Text>

          <Text style={styles.disclaimerText}>
            <Text style={styles.bold}>Em caso de emergência hipertensiva</Text> (pressão &gt; 180/120 mmHg com sintomas), procure imediatamente uma emergência ou ligue 192 (SAMU).
          </Text>

          <Text style={styles.disclaimerText}>
            <Text style={styles.bold}>Classificações:</Text> As categorias (Normal, Elevada, Hipertensão 1/2, Crise) baseiam-se nas diretrizes 2017 AHA/ACC (American Heart Association / American College of Cardiology).
          </Text>

          <Text style={styles.disclaimerText}>
            <Text style={styles.bold}>Dados Pessoais:</Text> Todos os dados são armazenados apenas no seu dispositivo. Nenhuma informação é enviada para servidores externos.
          </Text>

          <Text style={styles.disclaimerText}>
            <Text style={styles.bold}>Precisão do Dispositivo:</Text> A precisão depende do seu medidor de pressão arterial. Certifique-se de que está calibrado e usar técnica correta.
          </Text>

          <Text style={styles.disclaimerText}>
            <Text style={styles.bold}>Monitore com seu Médico:</Text> Use este app para acompanhar tendências e compartilhe os registros com seu médico regularmente.
          </Text>
        </View>
      </View>

      {/* Checkbox and Accept Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Li e concordo com os termos acima
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.acceptButton, !agreed && styles.acceptButtonDisabled]}
          onPress={onAccept}
          disabled={!agreed}
          activeOpacity={0.85}
        >
          <Text style={styles.acceptButtonText}>Continuar para o App</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Você pode revisar este aviso a qualquer momento em Ajustes → Sobre.
        </Text>
      </View>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  headerIcon: {
    fontSize: 48,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  disclaimerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.hypertension2,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  disclaimerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.hypertension2,
  },
  disclaimerContent: {
    gap: spacing.md,
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  footer: {
    gap: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  acceptButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  acceptButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
