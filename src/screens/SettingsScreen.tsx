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
import { colors, spacing, borderRadius, fontSize } from '../theme';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [userName, setUserName] = useState('');
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
    setUserName(loaded.userName);
    setReminderEnabled(loaded.reminderEnabled);
    setReminderTime(loaded.reminderTime);
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

      {/* Seção Lembretes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Lembretes</Text>

        <View style={styles.card}>
          <View style={styles.reminderToggleRow}>
            <View style={styles.reminderToggleLeft}>
              <Text style={styles.label}>Ativar Lembrete Diário</Text>
              <Text style={styles.reminderToggleSubtitle}>
                Receba uma notificação para medir sua pressão
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggleSwitch,
                reminderEnabled && styles.toggleSwitchActive,
              ]}
              onPress={handleToggleReminder}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.toggleCircle,
                  reminderEnabled && styles.toggleCircleActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          {reminderEnabled && (
            <>
              <View style={styles.divider} />
              <View style={styles.reminderTimeRow}>
                <Text style={styles.label}>Horário</Text>
                <View style={styles.timeInputContainer}>
                  {[9, 12, 15, 18, 21].map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeChip,
                        reminderTime === formatTimeString(hour) &&
                          styles.timeChipActive,
                      ]}
                      onPress={() => handleChangeReminderTime(formatTimeString(hour))}
                    >
                      <Text
                        style={[
                          styles.timeChipText,
                          reminderTime === formatTimeString(hour) &&
                            styles.timeChipTextActive,
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

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleImportData}
            disabled={importing}
            activeOpacity={0.7}
          >
            {importing ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>📥 Importar Dados</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearData}
            activeOpacity={0.7}
          >
            <Text style={styles.dangerButtonText}>🗑️ Limpar Tudo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Seção Sobre */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Sobre</Text>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('About')}
          activeOpacity={0.7}
        >
          <Text style={styles.linkButtonIcon}>📱</Text>
          <View style={styles.linkButtonContent}>
            <Text style={styles.linkButtonTitle}>Sobre o dPressao</Text>
            <Text style={styles.linkButtonSubtitle}>Versão 1.0.0 · Créditos e funcionalidades</Text>
          </View>
          <Text style={styles.linkButtonArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          activeOpacity={0.7}
        >
          <Text style={styles.linkButtonIcon}>🔒</Text>
          <View style={styles.linkButtonContent}>
            <Text style={styles.linkButtonTitle}>Política de Privacidade</Text>
            <Text style={styles.linkButtonSubtitle}>Como seus dados são protegidos</Text>
          </View>
          <Text style={styles.linkButtonArrow}>›</Text>
        </TouchableOpacity>

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
    flex: 1,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dangerButton: {
    backgroundColor: colors.hypertension2,
    flex: 1,
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
  linkButton: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
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
    color: colors.textMuted,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: colors.primary,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textMuted,
  },
  toggleCircleActive: {
    backgroundColor: colors.text,
    alignSelf: 'flex-end',
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
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  timeChipTextActive: {
    color: colors.text,
  },
});
