import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { BloodPressureReading, ExamEntry } from '../types';
import { getReadings } from '../storage/readings';
import { getSettings } from '../storage/settings';
import { getProfile } from '../storage/user';
import { classifyBP, formatDate } from '../utils/bloodPressure';
import { ReadingCard } from '../components/ReadingCard';
import { generatePDFReport } from '../utils/pdfReport';
import { exportAsCSV, exportAsJSON } from '../utils/exportData';
import { GlassBackground } from '../components/GlassBackground';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize } from '../theme';

type Filter = 'all' | 'normal' | 'elevated' | 'hypertension1' | 'hypertension2' | 'crisis';

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: 'all', label: 'Todas', emoji: '📋' },
  { key: 'normal', label: 'Normal', emoji: '🟢' },
  { key: 'elevated', label: 'Elevada', emoji: '🟡' },
  { key: 'hypertension1', label: 'Hiper 1', emoji: '🟠' },
  { key: 'hypertension2', label: 'Hiper 2', emoji: '🔴' },
  { key: 'crisis', label: 'Crise', emoji: '🚨' },
];

export function HistoryScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [exporting, setExporting] = useState(false);

  const loadReadings = useCallback(async () => {
    const data = await getReadings();
    setReadings(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReadings();
    }, [loadReadings])
  );

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      if (readings.length === 0) {
        Alert.alert('Sem dados', 'Nenhuma medição para exportar.');
        return;
      }

      const [settings, profile] = await Promise.all([getSettings(), getProfile()]);

      // Convert exam photos to base64 for embedding in PDF
      if (profile.exams && profile.exams.length > 0) {
        const examsWithBase64: ExamEntry[] = await Promise.all(
          profile.exams.map(async (exam) => {
            if (!exam.photoUri) return exam;
            try {
              const base64 = await FileSystem.readAsStringAsync(exam.photoUri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              return { ...exam, photoBase64: base64 };
            } catch {
              return exam;
            }
          })
        );
        profile.exams = examsWithBase64;
      }

      const html = generatePDFReport(readings, { userName: settings.userName, profile });
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar Relatório PDF',
        });
      } else {
        Alert.alert('Sucesso', 'PDF gerado com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', `Falha ao exportar PDF: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      if (readings.length === 0) {
        Alert.alert('Sem dados', 'Nenhuma medição para exportar.');
        return;
      }

      const csv = exportAsCSV(readings);
      const fileName = `dPressao_${new Date().getTime()}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: 'Compartilhar CSV',
        });
      } else {
        Alert.alert('Sucesso', 'CSV gerado com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', `Falha ao exportar CSV: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      if (readings.length === 0) {
        Alert.alert('Sem dados', 'Nenhuma medição para exportar.');
        return;
      }

      const json = exportAsJSON(readings);
      const fileName = `dPressao_backup_${new Date().getTime()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, json);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Compartilhar Backup JSON',
        });
      } else {
        Alert.alert('Sucesso', 'JSON salvo com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', `Falha ao exportar JSON: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    } finally {
      setExporting(false);
    }
  };

  const filteredReadings = readings.filter((r) => {
    if (filter === 'all') return true;
    const cls = classifyBP(r.systolic, r.diastolic);
    return cls.category === filter;
  });

  // Calcular médias
  const validReadings = readings.slice(0, 30);
  const avgSystolic =
    validReadings.length > 0
      ? Math.round(validReadings.reduce((s, r) => s + r.systolic, 0) / validReadings.length)
      : 0;
  const avgDiastolic =
    validReadings.length > 0
      ? Math.round(validReadings.reduce((s, r) => s + r.diastolic, 0) / validReadings.length)
      : 0;
  const avgPulse =
    validReadings.length > 0
      ? Math.round(validReadings.reduce((s, r) => s + r.pulse, 0) / validReadings.length)
      : 0;

  // Agrupar por data
  const grouped = filteredReadings.reduce<Record<string, BloodPressureReading[]>>((acc, r) => {
    const date = formatDate(r.date);
    if (!acc[date]) acc[date] = [];
    acc[date].push(r);
    return acc;
  }, {});

  const groupedList = Object.entries(grouped);

  return (
    <GlassBackground>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        <FlatList
          data={groupedList}
          keyExtractor={([date]) => date}
          contentContainerStyle={styles.content}
          ListHeaderComponent={
            <>
              {/* Resumo */}
              {readings.length > 0 && (
                <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.summaryTitle, { color: colors.textMuted }]}>
                    Média dos últimos {Math.min(readings.length, 30)}{' '}
                    {Math.min(readings.length, 30) === 1 ? 'registro' : 'registros'}
                  </Text>
                  <View style={styles.summaryStats}>
                    <View style={styles.summaryItem}>
                      <Text
                        style={[styles.summaryValue, { color: colors.text }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                      >
                        {avgSystolic}/{avgDiastolic}
                      </Text>
                      <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>mmHg</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>{avgPulse}</Text>
                      <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>bpm</Text>
                    </View>
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: colors.text }]}>{readings.length}</Text>
                      <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                        {readings.length === 1 ? 'medição' : 'medições'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Botões de Exportação */}
              {readings.length > 0 && (
                <View style={styles.exportSection}>
                  <Text style={[styles.exportTitle, { color: colors.textMuted }]}>📥 Exportar Dados</Text>
                  <View style={styles.exportButtons}>
                    <TouchableOpacity
                      style={[styles.exportButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={handleExportPDF}
                      disabled={exporting}
                    >
                      {exporting ? (
                        <ActivityIndicator size="small" color={colors.text} />
                      ) : (
                        <>
                          <Text style={styles.exportButtonIcon}>📄</Text>
                          <Text style={[styles.exportButtonLabel, { color: colors.text }]}>PDF</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.exportButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={handleExportCSV}
                      disabled={exporting}
                    >
                      {exporting ? (
                        <ActivityIndicator size="small" color={colors.text} />
                      ) : (
                        <>
                          <Text style={styles.exportButtonIcon}>📊</Text>
                          <Text style={[styles.exportButtonLabel, { color: colors.text }]}>CSV</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.exportButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={handleExportJSON}
                      disabled={exporting}
                    >
                      {exporting ? (
                        <ActivityIndicator size="small" color={colors.text} />
                      ) : (
                        <>
                          <Text style={styles.exportButtonIcon}>💾</Text>
                          <Text style={[styles.exportButtonLabel, { color: colors.text }]}>Backup</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Filtros */}
              <View style={styles.filtersWrapper}>
                <FlatList
                  data={FILTERS}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(f) => f.key}
                  contentContainerStyle={styles.filters}
                  renderItem={({ item: f }) => (
                    <TouchableOpacity
                      key={f.key}
                      style={[
                        styles.filterChip,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                        filter === f.key && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                      onPress={() => setFilter(f.key)}
                    >
                      <Text style={styles.filterEmoji}>{f.emoji}</Text>
                      <Text
                        style={[
                          styles.filterLabel,
                          { color: colors.textSecondary },
                          filter === f.key && styles.filterLabelActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </>
          }
          renderItem={({ item: [date, dayReadings] }) => (
            <View style={styles.dateGroup}>
              <Text style={[styles.dateHeader, { color: colors.text }]}>{date}</Text>
              {dayReadings.map((reading) => (
                <ReadingCard
                  key={reading.id}
                  reading={reading}
                  onDelete={loadReadings}
                />
              ))}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma medição encontrada</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {filter !== 'all'
                  ? 'Nenhuma medição nesta categoria.'
                  : 'Comece registrando sua primeira medição.'}
              </Text>
              {filter === 'all' && (
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('NewReading')}
                >
                  <Text style={styles.emptyButtonText}>➕ Nova Medição</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  summaryCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'stretch',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    minWidth: 0,
  },
  summaryValue: {
    fontSize: fontSize.xxl,
    fontWeight: '900',
    width: '100%',
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  summaryDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  filtersWrapper: {
    marginBottom: spacing.md,
  },
  filters: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  filterEmoji: {
    fontSize: fontSize.sm,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  filterLabelActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dateGroup: {
    marginBottom: spacing.md,
  },
  dateHeader: {
    fontSize: fontSize.md,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  exportSection: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  exportTitle: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  exportButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
  },
  exportButtonIcon: {
    fontSize: fontSize.lg,
  },
  exportButtonLabel: {
    fontSize: fontSize.xs,
    fontWeight: '800',
  },
});
