import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlassBackground } from '../components/GlassBackground';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize } from '../theme';

export function AboutScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const handleOpenPrivacy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <GlassBackground>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        {/* App Icon and Title */}
        <View style={styles.header}>
          <Text style={styles.appIcon}>🫀</Text>
          <Text style={[styles.appName, { color: colors.text }]}>dPressao</Text>
          <Text style={[styles.appVersion, { color: colors.textMuted }]}>Versão 1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.description, { color: colors.textSecondary, backgroundColor: colors.surface }]}>
            Monitore sua pressão arterial de forma simples e segura. Todos os dados ficam armazenados apenas no seu dispositivo.
          </Text>
        </View>

        {/* Medical Standards */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>📋 Padrões Médicos</Text>
          <View style={styles.standardsContainer}>
            <StandardItem
              label="Classificação de PA"
              value="AHA/ACC 2017"
              colors={colors}
            />
            <StandardItem
              label="Categorias"
              value="5 níveis (Normal até Crise)"
              colors={colors}
            />
            <StandardItem
              label="Armazenamento"
              value="Local apenas (seu dispositivo)"
              colors={colors}
            />
          </View>
        </View>

        {/* Features */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>✨ Funcionalidades</Text>
          <FeatureItem emoji="📊" text="Gráficos de tendências com filtros por período" colors={colors} />
          <FeatureItem emoji="📋" text="Histórico completo de medições" colors={colors} />
          <FeatureItem emoji="📈" text="Estatísticas detalhadas (média, min, máx)" colors={colors} />
          <FeatureItem emoji="📄" text="Exportar dados em PDF, CSV ou JSON" colors={colors} />
          <FeatureItem emoji="🔐" text="Privacidade total - zero coleta de dados" colors={colors} />
          <FeatureItem emoji="⚙️" text="Configurações personalizáveis" colors={colors} />
        </View>

        {/* Important Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Documentos Importantes</Text>
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleOpenPrivacy}
            activeOpacity={0.7}
          >
            <Text style={styles.linkButtonIcon}>🔒</Text>
            <View style={styles.linkButtonContent}>
              <Text style={[styles.linkButtonTitle, { color: colors.text }]}>Política de Privacidade</Text>
              <Text style={[styles.linkButtonSubtitle, { color: colors.textMuted }]}>Como seus dados são protegidos</Text>
            </View>
            <Text style={[styles.linkButtonArrow, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={[styles.disclaimerCard, { backgroundColor: colors.surface, borderLeftColor: colors.hypertension2 }]}>
          <Text style={[styles.disclaimerTitle, { color: colors.hypertension2 }]}>⚠️ Aviso Importante</Text>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            Este aplicativo é apenas para acompanhamento pessoal e não substitui orientação médica. Em caso de emergência hipertensiva (PA &gt; 180/120 mmHg com sintomas), procure um hospital imediatamente.
          </Text>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Créditos</Text>
          <CreditItem label="Desenvolvedor" value="Gianluka Moraes" colors={colors} />
        </View>

        {/* License */}
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.footerTitle, { color: colors.text }]}>Licença</Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            dPressao é um projeto open-source desenvolvido para ajudar pessoas a monitorarem sua saúde de forma independente e privada.
          </Text>
        </View>
      </ScrollView>
    </GlassBackground>
  );
}

interface FeatureItemProps {
  emoji: string;
  text: string;
  colors: any;
}

function FeatureItem({ emoji, text, colors }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
      <Text style={[styles.featureText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

interface CreditItemProps {
  label: string;
  value: string;
  colors: any;
}

function CreditItem({ label, value, colors }: CreditItemProps) {
  return (
    <View style={[styles.creditItem, { borderBottomColor: colors.border }]}>
      <Text style={[styles.creditLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.creditValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

interface StandardItemProps {
  label: string;
  value: string;
  colors: any;
}

function StandardItem({ label, value, colors }: StandardItemProps) {
  return (
    <View style={styles.standardItem}>
      <Text style={[styles.standardLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.standardValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  appVersion: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
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
    flex: 1,
  },
  standardValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
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
  },
  linkButton: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
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
  },
  linkButtonSubtitle: {
    fontSize: fontSize.xs,
  },
  linkButtonArrow: {
    fontSize: fontSize.lg,
  },
  disclaimerCard: {
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  disclaimerTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  creditItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  creditLabel: {
    fontSize: fontSize.sm,
  },
  creditValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  footer: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  footerTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  footerText: {
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
});
