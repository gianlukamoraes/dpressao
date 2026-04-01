import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize } from '../theme';

export function AboutScreen() {
  const navigation = useNavigation<any>();

  const handleOpenPrivacy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleOpenGitHub = async () => {
    const url = 'https://github.com/dpressao';
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error('Failed to open GitHub:', err);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* App Icon and Title */}
      <View style={styles.header}>
        <Text style={styles.appIcon}>🫀</Text>
        <Text style={styles.appName}>dPressao</Text>
        <Text style={styles.appVersion}>Versão 1.0.0</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.description}>
          Monitore sua pressão arterial de forma simples e segura. Todos os dados ficam armazenados apenas no seu dispositivo.
        </Text>
      </View>

      {/* Medical Standards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 Padrões Médicos</Text>
        <View style={styles.standardsContainer}>
          <StandardItem
            label="Classificação de PA"
            value="AHA/ACC 2017"
          />
          <StandardItem
            label="Categorias"
            value="5 níveis (Normal até Crise)"
          />
          <StandardItem
            label="Armazenamento"
            value="Local apenas (seu dispositivo)"
          />
        </View>
      </View>

      {/* Features */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✨ Funcionalidades</Text>
        <FeatureItem emoji="📊" text="Gráficos de tendências com filtros por período" />
        <FeatureItem emoji="📋" text="Histórico completo de medições" />
        <FeatureItem emoji="📈" text="Estatísticas detalhadas (média, min, máx)" />
        <FeatureItem emoji="📄" text="Exportar dados em PDF, CSV ou JSON" />
        <FeatureItem emoji="🔐" text="Privacidade total - zero coleta de dados" />
        <FeatureItem emoji="⚙️" text="Configurações personalizáveis" />
      </View>

      {/* Important Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentos Importantes</Text>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleOpenPrivacy}
          activeOpacity={0.7}
        >
          <Text style={styles.linkButtonIcon}>🔒</Text>
          <View style={styles.linkButtonContent}>
            <Text style={styles.linkButtonTitle}>Política de Privacidade</Text>
            <Text style={styles.linkButtonSubtitle}>Como seus dados são protegidos</Text>
          </View>
          <Text style={styles.linkButtonArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleOpenGitHub}
          activeOpacity={0.7}
        >
          <Text style={styles.linkButtonIcon}>💻</Text>
          <View style={styles.linkButtonContent}>
            <Text style={styles.linkButtonTitle}>Código-Fonte (GitHub)</Text>
            <Text style={styles.linkButtonSubtitle}>Transparência e open-source</Text>
          </View>
          <Text style={styles.linkButtonArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>⚠️ Aviso Importante</Text>
        <Text style={styles.disclaimerText}>
          Este aplicativo é apenas para acompanhamento pessoal e não substitui orientação médica. Em caso de emergência hipertensiva (PA &gt; 180/120 mmHg com sintomas), procure um hospital imediatamente.
        </Text>
      </View>

      {/* Credits */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Créditos</Text>
        <CreditItem label="Desenvolvido com" value="React Native + Expo" />
        <CreditItem label="Padrões Médicos" value="AHA/ACC 2017" />
        <CreditItem label="Ícones" value="Emojis Unicode" />
        <CreditItem label="Armazenamento" value="AsyncStorage" />
      </View>

      {/* License */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Licença</Text>
        <Text style={styles.footerText}>
          dPressao é um projeto open-source desenvolvido para ajudar pessoas a monitorarem sua saúde de forma independente e privada.
        </Text>
      </View>
    </ScrollView>
  );
}

interface FeatureItemProps {
  emoji: string;
  text: string;
}

function FeatureItem({ emoji, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

interface CreditItemProps {
  label: string;
  value: string;
}

function CreditItem({ label, value }: CreditItemProps) {
  return (
    <View style={styles.creditItem}>
      <Text style={styles.creditLabel}>{label}</Text>
      <Text style={styles.creditValue}>{value}</Text>
    </View>
  );
}

interface StandardItemProps {
  label: string;
  value: string;
}

function StandardItem({ label, value }: StandardItemProps) {
  return (
    <View style={styles.standardItem}>
      <Text style={styles.standardLabel}>{label}</Text>
      <Text style={styles.standardValue}>{value}</Text>
    </View>
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
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  appIcon: {
    fontSize: 64,
  },
  appName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  appVersion: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  standardsContainer: {
    gap: spacing.md,
  },
  standardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  standardLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  standardValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureEmoji: {
    fontSize: fontSize.lg,
    width: 20,
    textAlign: 'center',
  },
  featureText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  linkButton: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkButtonIcon: {
    fontSize: fontSize.xl,
    marginRight: spacing.md,
  },
  linkButtonContent: {
    flex: 1,
    gap: spacing.xs,
  },
  linkButtonTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },
  linkButtonSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  linkButtonArrow: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  disclaimerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.hypertension2,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  disclaimerTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.hypertension2,
  },
  disclaimerText: {
    fontSize: fontSize.xs,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  creditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  creditLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  creditValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  footer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  footerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  footerText: {
    fontSize: fontSize.xs,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
