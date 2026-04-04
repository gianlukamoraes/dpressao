import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { GlassBackground } from '../components/GlassBackground';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize } from '../theme';

interface DisclaimerScreenProps {
  onAccept: () => void;
}

export function DisclaimerScreen({ onAccept }: DisclaimerScreenProps) {
  const { colors } = useTheme();
  const [agreed, setAgreed] = useState(false);

  return (
    <GlassBackground>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>⚠️</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Aviso de Saúde Importante</Text>
        </View>

        {/* Medical Disclaimer */}
        <View style={[styles.disclaimerCard, { backgroundColor: colors.surface, borderLeftColor: colors.hypertension2 }]}>
          <Text style={[styles.disclaimerTitle, { color: colors.hypertension2 }]}>Isenção de Responsabilidade Médica</Text>

          <View style={styles.disclaimerContent}>
            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
              <Text style={[styles.bold, { color: colors.text }]}>Este aplicativo é apenas para registro pessoal.</Text> Ele não substitui consulta médica profissional, diagnóstico ou tratamento.
            </Text>

            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
              <Text style={[styles.bold, { color: colors.text }]}>Em caso de emergência hipertensiva</Text> (pressão &gt; 180/120 mmHg com sintomas), procure imediatamente uma emergência ou ligue 192 (SAMU).
            </Text>

            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
              <Text style={[styles.bold, { color: colors.text }]}>Classificações:</Text> As categorias (Normal, Elevada, Hipertensão 1/2, Crise) baseiam-se nas diretrizes 2017 AHA/ACC (American Heart Association / American College of Cardiology).
            </Text>

            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
              <Text style={[styles.bold, { color: colors.text }]}>Dados Pessoais:</Text> Todos os dados são armazenados apenas no seu dispositivo. Nenhuma informação é enviada para servidores externos.
            </Text>

            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
              <Text style={[styles.bold, { color: colors.text }]}>Precisão do Dispositivo:</Text> A precisão depende do seu medidor de pressão arterial. Certifique-se de que está calibrado e usar técnica correta.
            </Text>

            <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
              <Text style={[styles.bold, { color: colors.text }]}>Monitore com seu Médico:</Text> Use este app para acompanhar tendências e compartilhe os registros com seu médico regularmente.
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
            <View style={[
              styles.checkbox,
              { borderColor: colors.border },
              agreed && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}>
              {agreed && <Text style={[styles.checkmark, { color: colors.text }]}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Li e concordo com os termos acima
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.acceptButton,
              { backgroundColor: colors.primary },
              !agreed && { backgroundColor: colors.textMuted, opacity: 0.5 },
            ]}
            onPress={onAccept}
            disabled={!agreed}
            activeOpacity={0.85}
          >
            <Text style={[styles.acceptButtonText, { color: colors.text }]}>Continuar para o App</Text>
          </TouchableOpacity>

          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Você pode revisar este aviso a qualquer momento em Ajustes → Sobre.
          </Text>
        </View>
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
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
    textAlign: 'center',
  },
  disclaimerCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  disclaimerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  disclaimerContent: {
    gap: spacing.md,
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
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
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  acceptButton: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  acceptButtonText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  footerText: {
    fontSize: fontSize.xs,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
