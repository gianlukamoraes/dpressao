import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { saveReading, updateReading, getReadings } from '../storage/readings';
import { BloodPressureReading } from '../types';
import { classifyBP } from '../utils/bloodPressure';
import { BPBadge } from '../components/BPBadge';
import { SYMPTOMS, SYMPTOMS_INITIAL_VISIBLE } from '../utils/symptoms';
import { GlassBackground } from '../components/GlassBackground';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize } from '../theme';
import { RootStackParamList } from '../types/navigation';

type NewReadingRouteProps = RouteProp<RootStackParamList, 'NewReading'>;

export function NewReadingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<NewReadingRouteProps>();
  const { colors } = useTheme();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [note, setNote] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.readingId) {
      loadReadingForEdit(route.params.readingId);
    }
  }, [route.params?.readingId]);

  async function loadReadingForEdit(id: string) {
    const readings = await getReadings();
    const reading = readings.find((r) => r.id === id);
    if (reading) {
      setSystolic(reading.systolic.toString());
      setDiastolic(reading.diastolic.toString());
      setPulse(reading.pulse.toString());
      setNote(reading.note || '');
      setSelectedSymptoms(reading.symptoms ?? []);
      setIsEditing(true);
      setEditingId(id);
    }
  }

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  const visibleSymptoms = showAllSymptoms ? SYMPTOMS : SYMPTOMS.slice(0, SYMPTOMS_INITIAL_VISIBLE);

  const isValid =
    systolic.trim() !== '' &&
    diastolic.trim() !== '' &&
    pulse.trim() !== '' &&
    Number(systolic) > 0 &&
    Number(diastolic) > 0 &&
    Number(pulse) > 0;

  const previewClassification =
    systolic && diastolic
      ? classifyBP(Number(systolic), Number(diastolic))
      : null;

  async function handleSave() {
    if (!isValid) {
      Alert.alert('Campos obrigatórios', 'Preencha sistólica, diastólica e pulso.');
      return;
    }

    const sys = Number(systolic);
    const dia = Number(diastolic);
    const pul = Number(pulse);

    if (sys < 60 || sys > 300) {
      Alert.alert('Valor inválido', 'Sistólica deve estar entre 60 e 300 mmHg.');
      return;
    }
    if (dia < 40 || dia > 200) {
      Alert.alert('Valor inválido', 'Diastólica deve estar entre 40 e 200 mmHg.');
      return;
    }
    if (pul < 30 || pul > 250) {
      Alert.alert('Valor inválido', 'Pulso deve estar entre 30 e 250 bpm.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing && editingId) {
        await updateReading(editingId, {
          systolic: sys,
          diastolic: dia,
          pulse: pul,
          note: note.trim() || undefined,
          symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
        });
      } else {
        await saveReading({
          systolic: sys,
          diastolic: dia,
          pulse: pul,
          date: new Date().toISOString(),
          note: note.trim() || undefined,
          symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
        });
      }
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a medição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{isEditing ? 'Editar Medição' : 'Nova Medição'}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <Text style={[styles.time, { color: colors.primary }]}>
              {new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          {/* Preview classificação */}
          {previewClassification && (
            <View style={[styles.previewCard, { borderColor: previewClassification.color, backgroundColor: previewClassification.bgColor }]}>
              <BPBadge classification={previewClassification} size="lg" />
              <Text style={[styles.previewDescription, { color: previewClassification.color }]}>
                {previewClassification.description}
              </Text>
            </View>
          )}

          {/* Campos principais */}
          <View style={[styles.fieldsRow, { backgroundColor: colors.surface }]}>
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Sistólica</Text>
              <Text style={[styles.fieldHint, { color: colors.textMuted }]}>mmHg</Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.text, borderBottomColor: colors.border }]}
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="numeric"
                placeholder="120"
                placeholderTextColor={colors.textMuted}
                maxLength={3}
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.separator, { color: colors.textMuted }]}>/</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Diastólica</Text>
              <Text style={[styles.fieldHint, { color: colors.textMuted }]}>mmHg</Text>
              <TextInput
                style={[styles.fieldInput, { color: colors.text, borderBottomColor: colors.border }]}
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="numeric"
                placeholder="80"
                placeholderTextColor={colors.textMuted}
                maxLength={3}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Pulso */}
          <View style={[styles.pulseRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>💓 Pulso</Text>
            <View style={styles.pulseInputWrapper}>
              <TextInput
                style={[styles.pulseInput, { color: colors.text, borderBottomColor: colors.border }]}
                value={pulse}
                onChangeText={setPulse}
                keyboardType="numeric"
                placeholder="72"
                placeholderTextColor={colors.textMuted}
                maxLength={3}
              />
              <Text style={[styles.pulseUnit, { color: colors.textSecondary }]}>bpm</Text>
            </View>
          </View>

          {/* Sintomas */}
          <View style={[styles.symptomsContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>🩺 Como você está se sentindo?</Text>
            <View style={styles.chipsRow}>
              {visibleSymptoms.map((symptom) => {
                const selected = selectedSymptoms.includes(symptom);
                return (
                  <TouchableOpacity
                    key={symptom}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => toggleSymptom(symptom)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.chipText,
                      { color: colors.textSecondary },
                      selected && { color: colors.text, fontWeight: '700' },
                    ]}>
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {!showAllSymptoms && (
                <TouchableOpacity
                  style={[styles.chipMore, { borderColor: colors.primary }]}
                  onPress={() => setShowAllSymptoms(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipMoreText, { color: colors.primary }]}>Ver mais...</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Observação */}
          <View style={[styles.noteContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>💬 Sintoma não listado / Observação (opcional)</Text>
            <TextInput
              style={[styles.noteInput, { color: colors.text }]}
              value={note}
              onChangeText={setNote}
              placeholder="Ex: após exercício, em repouso, estressado..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>{note.length}/200</Text>
          </View>

          {/* Botões */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }, !isValid && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            <Text style={[styles.saveButtonText, { color: colors.text }]}>
              {loading ? 'Salvando...' : '✅ Salvar Medição'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  time: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: 4,
  },
  previewCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: spacing.xs,
  },
  previewDescription: {
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  fieldsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  fieldGroup: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: fontSize.xs,
  },
  fieldInput: {
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    borderBottomWidth: 2,
    paddingVertical: spacing.xs,
    width: '100%',
  },
  separator: {
    fontSize: 40,
    fontWeight: '300',
    marginBottom: spacing.xs,
  },
  pulseRow: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pulseInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pulseInput: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'right',
    borderBottomWidth: 2,
    paddingVertical: spacing.xs,
    minWidth: 60,
  },
  pulseUnit: {
    fontSize: fontSize.md,
  },
  symptomsContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  chipMore: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
  },
  chipMoreText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  noteContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  noteInput: {
    fontSize: fontSize.md,
    textAlignVertical: 'top',
    paddingTop: spacing.xs,
    minHeight: 72,
  },
  charCount: {
    fontSize: fontSize.xs,
    textAlign: 'right',
  },
  saveButton: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
  },
});
