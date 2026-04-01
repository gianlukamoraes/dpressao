import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize } from '../theme';

export function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <Text style={styles.title}>Política de Privacidade</Text>
      <Text style={styles.lastUpdated}>Última atualização: Abril 2026</Text>

      <Section
        title="1. Visão Geral"
        content="O aplicativo dPressao foi desenvolvido como uma ferramenta para ajudar você a monitorar sua pressão arterial de forma pessoal. Esta política descreve como seus dados são tratados."
      />

      <Section
        title="2. Coleta de Dados"
        content="dPressao coleta apenas os dados que você insere manualmente:
• Leituras de pressão arterial (sistólica, diastólica)
• Frequência cardíaca (pulso)
• Data e hora das medições
• Notas opcionais sobre contexto da medição
• Nome do usuário (opcional)
• Preferências de lembrete

Nenhum dado é coletado automaticamente sem sua ação."
      />

      <Section
        title="3. Armazenamento de Dados"
        content="Todos os seus dados são armazenados APENAS no seu dispositivo, usando o AsyncStorage local do React Native. Seus dados:
• Não são enviados para nenhum servidor
• Não são sincronizados na nuvem
• Não são compartilhados com terceiros
• Permanecem privados em seu dispositivo"
      />

      <Section
        title="4. Segurança"
        content="Os dados são armazenados no banco de dados local do dispositivo, protegido pelas mesmas medidas de segurança do sistema operacional (iOS ou Android). Recomendamos:
• Usar senha/biometria em seu dispositivo
• Não compartilhar seu dispositivo com outras pessoas
• Manter seu dispositivo atualizado"
      />

      <Section
        title="5. Análise e Rastreamento"
        content="dPressao NÃO coleta:
• Dados de uso ou comportamento
• Identificadores únicos de dispositivo
• Localização
• Informações de conta ou login
• Análises de terceiros ou trackers
• Cookies ou identificadores similares"
      />

      <Section
        title="6. Terceiros"
        content="dPressao não integra-se com:
• Serviços de análise (Google Analytics, etc.)
• Publicidade
• Redes sociais
• Sincronização com HealthKit ou Google Fit
• Qualquer API externa de terceiros

Seu app funciona completamente offline e independente."
      />

      <Section
        title="7. Controle de Dados"
        content="Você tem controle total sobre seus dados:
• Exportar: Você pode exportar seus dados em PDF, CSV ou JSON
• Deletar: Você pode deletar registros individuais ou todos os dados
• Backup: Você pode fazer backup de seus dados exportando como JSON
• Restaurar: Você pode restaurar dados a partir de um arquivo JSON exportado anteriormente"
      />

      <Section
        title="8. Retenção de Dados"
        content="Seus dados são retidos indefinidamente no seu dispositivo até que você opte por:
• Deletar registros individuais
• Limpar todos os dados via Ajustes
• Desinstalar o aplicativo (dados também serão removidos)"
      />

      <Section
        title="9. Conformidade Legal"
        content="dPressao foi desenvolvido em conformidade com:
• LGPD (Lei Geral de Proteção de Dados) - Lei brasileira de privacidade
• GDPR (Regulamento Geral de Proteção de Dados) - Lei da UE
• Políticas das App Stores (Apple e Google)

Como um aplicativo de saúde, informamos que não coletamos informações sensíveis de forma centralizada, mantendo tudo local no dispositivo do usuário."
      />

      <Section
        title="10. Direitos do Usuário"
        content="Você tem o direito a:
• Acessar todos seus dados a qualquer momento
• Exportar seus dados em formato legível
• Deletar todos seus dados permanentemente
• Nenhuma retenção de dados após deleção
• Nenhum rastreamento de sua atividade"
      />

      <Section
        title="11. Contato e Suporte"
        content="Se tiver dúvidas sobre privacidade ou como seus dados são tratados, você pode revisar o código-fonte do aplicativo (open source) ou entrar em contato através das informações de suporte na App Store."
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Este aplicativo respeita sua privacidade. Nenhum governo, empresa ou terceiro tem acesso aos seus dados pessoais de saúde.
        </Text>
      </View>
    </ScrollView>
  );
}

interface SectionProps {
  title: string;
  content: string;
}

function Section({ title, content }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  lastUpdated: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionContent: {
    fontSize: fontSize.sm,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
