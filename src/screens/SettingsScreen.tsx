import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppSettings } from '../types';
import { getSettings, updateSettings, resetSettings } from '../storage/settings';
import { getReadings, deleteReading } from '../storage/readings';
import { colors, spacing, borderRadius, fontSize } from '../theme';

export function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [userName, setUserName] = useState('');
  const [readingCount, setReadingCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  async function loadSettings() {
    const loaded = await getSettings();
    setSettings(loaded);
    setUserName(loaded.userName);
    const readings = await getReadings();
    setReadingCount(readings.length);
  }

  async function handleSaveName() {
    if (!settings) return;
    await updateSettings({ ...settings, userName });
    setSettings({ ...settings, userName });
  }

  async function handleClearData() {
    Alert.alert(
      'Excluir todos os dados',
      'Tem certeza? Esta ação não pode ser desfeita. Todos os registros serão permanentemente deletados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar tudo',
          style: 'destructive',
          onPress: async () => {
            const readings = await getReadings();
            for (const reading of readings) {
              await deleteReading(reading.id);
            }
            await loadSettings();
            Alert.alert('Sucesso', 'Todos os dados foram deletados.');
          },
        },
      ]
    );
  }

  if (!settings) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Ajustes</Text>
        <Text style={styles.subtitle}>Configurações do aplicativo</Text>
      </View>

      {/* Seção Perfil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Perfil</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Seu nome</Text>
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholder="Ex: Gianluka"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSaveName}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Salvar Nome</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Seção Dados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Dados</Text>

        <View style={styles.card}>
          <View style={styles.statRow}>
            <View>
              <Text style={styles.statLabel}>Total de medições</Text>
              <Text style={styles.statValue}>{readingCount}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Último acesso</Text>
              <Text style={styles.statValue}>Hoje</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearData}
          activeOpacity={0.7}
        >
          <Text style={styles.dangerButtonText}>🗑️ Limpar todos os dados</Text>
        </TouchableOpacity>
      </View>

      {/* Seção Sobre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Sobre</Text>

        <View style={styles.card}>
          {[
            { label: 'Versão', value: '1.0.0' },
            { label: 'Aplicativo', value: 'dPressão' },
            { label: 'Referência clínica', value: 'AHA / ACC 2017' },
          ].map((item, idx) => (
            <View
              key={item.label}
              style={[
                styles.aboutRow,
                idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm },
              ]}
            >
              <Text style={styles.aboutLabel}>{item.label}</Text>
              <Text style={styles.aboutValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            ⚕️ <Text style={{ fontWeight: '700', color: colors.hypertension2 }}>Aviso:</Text>{' '}
            Este aplicativo é apenas para monitoramento pessoal e não substitui consulta médica.
            Em caso de crise hipertensiva (≥180/120 mmHg), procure atendimento de emergência imediatamente.
          </Text>
        </View>
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
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  dangerButton: {
    backgroundColor: colors.hypertension2,
  },
  dangerButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xs,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  aboutValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  disclaimerCard: {
    backgroundColor: colors.hypertension2Bg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.hypertension2,
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
