import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { AppSettings } from '../types';
import { getSettings, updateSettings, resetSettings } from '../storage/settings';
import { getReadings, deleteReading } from '../storage/readings';
import { importFromJSON, importFromCSV } from '../utils/exportData';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllReminders,
  parseTimeString,
  formatTimeString,
} from '../utils/notifications';
import { spacing, borderRadius, fontSize } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { colors, theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [readingCount, setReadingCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  async function loadSettings() {
    const loaded = await getSettings();
    setSettings(loaded);
    setReminderEnabled(loaded.reminderEnabled);
    setReminderTime(loaded.reminderTime);
    const readings = await getReadings();
    setReadingCount(readings.length);
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

  async function handleImportData() {
    try {
      setImporting(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv'],
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name || '';
      const fileContent = await FileSystem.readAsStringAsync(fileUri);

      let importedCount = 0;

      if (fileName.endsWith('.json')) {
        importedCount = await importFromJSON(fileContent);
      } else if (fileName.endsWith('.csv')) {
        importedCount = await importFromCSV(fileContent);
      } else {
        Alert.alert('Erro', 'Formato de arquivo não suportado. Use JSON ou CSV.');
        return;
      }

      await loadSettings();

      Alert.alert(
        'Importação Concluída',
        `${importedCount} novo(s) registro(s) importado(s) com sucesso!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Erro ao importar',
        error instanceof Error ? error.message : 'Falha desconhecida'
      );
    } finally {
      setImporting(false);
    }
  }

  async function handleToggleReminder() {
    try {
      const newEnabled = !reminderEnabled;
      setReminderEnabled(newEnabled);

      if (newEnabled) {
        // Request permissions and schedule reminder
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permissão Negada',
            'Para usar lembretes, você precisa ativar notificações nas configurações do dispositivo.'
          );
          setReminderEnabled(false);
          return;
        }

        // Schedule the reminder
        const { hour } = parseTimeString(reminderTime);
        await scheduleDailyReminder(hour);
      } else {
        // Cancel reminders
        await cancelAllReminders();
      }

      // Update settings
      if (settings) {
        await updateSettings({
          ...settings,
          reminderEnabled: newEnabled,
          reminderTime,
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao configurar lembrete.');
      setReminderEnabled(!reminderEnabled);
    }
  }

  async function handleChangeReminderTime(time: string) {
    try {
      setReminderTime(time);

      // If reminder is enabled, reschedule with new time
      if (reminderEnabled) {
        const { hour } = parseTimeString(time);
        await scheduleDailyReminder(hour);
      }

      // Update settings
      if (settings) {
        await updateSettings({
          ...settings,
          reminderEnabled,
          reminderTime: time,
        });
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao mudar horário do lembrete.');
    }
  }

  if (!settings) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>⚙️ Ajustes</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Configurações do aplicativo</Text>
      </View>

      {/* Seção Aparência */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>🎨 Aparência</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.label, { color: colors.text }]}>Tema Visual</Text>
          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[
                styles.themeChip,
                { borderColor: colors.border, backgroundColor: colors.surfaceLight },
                theme === 'classic' && { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
              ]}
              onPress={() => setTheme('classic')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.themeChipText,
                { color: colors.textSecondary },
                theme === 'classic' && { color: colors.primary },
              ]}>
                ☀️ Visual Clássico
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeChip,
                { borderColor: colors.border, backgroundColor: colors.surfaceLight },
                theme === 'liquidGlass' && { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
              ]}
              onPress={() => setTheme('liquidGlass')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.themeChipText,
                { color: colors.textSecondary },
                theme === 'liquidGlass' && { color: colors.primary },
              ]}>
                🌙 Liquid Glass
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Seção Perfil */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>👤 Perfil</Text>

        <TouchableOpacity
          style={[styles.linkButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.linkButtonIcon}>🧑‍⚕️</Text>
          <View style={styles.linkButtonContent}>
            <Text style={[styles.linkButtonTitle, { color: colors.text }]}>Perfil Clínico</Text>
            <Text style={[styles.linkButtonSubtitle, { color: colors.textMuted }]}>Data de nascimento, medicamentos, exames e mais</Text>
          </View>
          <Text style={[styles.linkButtonArrow, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Seção Lembretes */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>🔔 Lembretes</Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.reminderToggleRow}>
            <View style={styles.reminderToggleLeft}>
              <Text style={[styles.label, { color: colors.text }]}>Ativar Lembrete Diário</Text>
              <Text style={[styles.reminderToggleSubtitle, { color: colors.textMuted }]}>
                Receba uma notificação para medir sua pressão
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleSwitch,
                { backgroundColor: colors.border },
                reminderEnabled && { backgroundColor: colors.primary },
              ]}
              onPress={handleToggleReminder}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.toggleCircle,
                  { backgroundColor: colors.textMuted },
                  reminderEnabled && { backgroundColor: colors.text, alignSelf: 'flex-end' },
                ]}
              />
            </TouchableOpacity>
          </View>

          {reminderEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.reminderTimeRow}>
                <Text style={[styles.label, { color: colors.text }]}>Horário</Text>
                <View style={styles.timeInputContainer}>
                  {[9, 12, 15, 18, 21].map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeChip,
                        { backgroundColor: colors.surfaceLight, borderColor: colors.border },
                        reminderTime === formatTimeString(hour) && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => handleChangeReminderTime(formatTimeString(hour))}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          { color: colors.textSecondary },
                          reminderTime === formatTimeString(hour) && { color: colors.text },
                        ]}
                      >
                        {formatTimeString(hour)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Seção Dados */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>📊 Dados</Text>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.statRow}>
            <View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total de medições</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{readingCount}</Text>
            </View>
            <View>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Último acesso</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>Hoje</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleImportData}
            disabled={importing}
            activeOpacity={0.7}
          >
            {importing ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.text }]}>📥 Importar Dados</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton, { backgroundColor: colors.hypertension2 }]}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <Text style={[styles.dangerButtonText, { color: colors.text }]}>🗑️ Limpar Tudo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Seção Sobre */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ℹ️ Sobre</Text>

        <TouchableOpacity
          style={[styles.linkButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('About')}
          activeOpacity={0.7}
        >
          <Text style={styles.linkButtonIcon}>📱</Text>
          <View style={styles.linkButtonContent}>
            <Text style={[styles.linkButtonTitle, { color: colors.text }]}>Sobre o dPressao</Text>
            <Text style={[styles.linkButtonSubtitle, { color: colors.textMuted }]}>Versão 1.0.0 · Créditos e funcionalidades</Text>
          </View>
          <Text style={[styles.linkButtonArrow, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          activeOpacity={0.7}
        >
          <Text style={styles.linkButtonIcon}>🔒</Text>
          <View style={styles.linkButtonContent}>
            <Text style={[styles.linkButtonTitle, { color: colors.text }]}>Política de Privacidade</Text>
            <Text style={[styles.linkButtonSubtitle, { color: colors.textMuted }]}>Como seus dados são protegidos</Text>
          </View>
          <Text style={[styles.linkButtonArrow, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>

        <View style={[styles.disclaimerCard, { backgroundColor: colors.hypertension2Bg, borderLeftColor: colors.hypertension2 }]}>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
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
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  button: {
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dangerButton: {
    flex: 1,
  },
  dangerButtonText: {
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: fontSize.md,
  },
  aboutValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  disclaimerCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  linkButtonIcon: {
    fontSize: fontSize.xl,
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
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  reminderToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderToggleLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  reminderToggleSubtitle: {
    fontSize: fontSize.xs,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  reminderTimeRow: {
    gap: spacing.md,
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  timeChip: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  timeChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  themeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  themeChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  themeChipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
