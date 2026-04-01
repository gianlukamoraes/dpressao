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
import { colors, spacing, borderRadius, fontSize } from '../theme';
import { RootStackParamList } from '../types/navigation';

type NewReadingRouteProps = RouteProp<RootStackParamList, 'NewReading'>;

export function NewReadingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<NewReadingRouteProps>();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [note, setNote] = useState('');
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
      setIsEditing(true);
      setEditingId(id);
    }
  }

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
        // Update existing reading
        await updateReading(editingId, {
          systolic: sys,
          diastolic: dia,
          pulse: pul,
          note: note.trim() || undefined,
        });
      } else {
        // Create new reading
        await saveReading({
          systolic: sys,
          diastolic: dia,
          pulse: pul,
          date: new Date().toISOString(),
          note: note.trim() || undefined,
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>{isEditing ? 'Editar Medição' : 'Nova Medição'}</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.time}>
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
        <View style={styles.fieldsRow}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Sistólica</Text>
            <Text style={styles.fieldHint}>mmHg</Text>
            <TextInput
              style={styles.fieldInput}
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="numeric"
              placeholder="120"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
              returnKeyType="next"
            />
          </View>

          <Text style={styles.separator}>/</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Diastólica</Text>
            <Text style={styles.fieldHint}>mmHg</Text>
            <TextInput
              style={styles.fieldInput}
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
        <View style={styles.pulseRow}>
          <Text style={styles.fieldLabel}>💓 Pulso</Text>
          <View style={styles.pulseInputWrapper}>
            <TextInput
              style={styles.pulseInput}
              value={pulse}
              onChangeText={setPulse}
              keyboardType="numeric"
              placeholder="72"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
            />
            <Text style={styles.pulseUnit}>bpm</Text>
          </View>
        </View>

        {/* Observação */}
        <View style={styles.noteContainer}>
          <Text style={styles.fieldLabel}>💬 Observação (opcional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Ex: após exercício, em repouso, estressado..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <Text style={styles.charCount}>{note.length}/200</Text>
        </View>

        {/* Botões */}
        <TouchableOpacity
          style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isValid || loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : '✅ Salvar Medição'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
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
    textTransform: 'capitalize',
  },
  time: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
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
    backgroundColor: colors.surface,
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
    color: colors.textSecondary,
    fontWeight: '600',
  },
  fieldHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  fieldInput: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
    width: '100%',
  },
  separator: {
    fontSize: 40,
    fontWeight: '300',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  pulseRow: {
    backgroundColor: colors.surface,
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
    color: colors.text,
    textAlign: 'right',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
    minWidth: 60,
  },
  pulseUnit: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  noteContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  noteInput: {
    fontSize: fontSize.md,
    color: colors.text,
    textAlignVertical: 'top',
    paddingTop: spacing.xs,
    minHeight: 72,
  },
  charCount: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: colors.primary,
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
    color: colors.text,
  },
  cancelButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
