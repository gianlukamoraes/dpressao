import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BiologicalSex, UserProfile } from '../types';
import { getProfile, saveProfile } from '../storage/user';
import { colors, spacing, borderRadius, fontSize } from '../theme';

function brToISO(br: string): string | undefined {
  const [day, month, year] = br.split('/');
  if (!day || !month || !year || year.length !== 4) return undefined;
  const d = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function isoToBR(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

function maskBirthDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

export function ProfileScreen() {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | undefined>(undefined);
  const [usesMedication, setUsesMedication] = useState(false);
  const [medicationDescription, setMedicationDescription] = useState('');
  const [hasGoal, setHasGoal] = useState(false);
  const [goalSystolic, setGoalSystolic] = useState('');
  const [goalDiastolic, setGoalDiastolic] = useState('');
  const [isDiabetic, setIsDiabetic] = useState(false);
  const [isSmoker, setIsSmoker] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setLoading(true);
        const p = await getProfile();
        setName(p.name);
        setBirthDate(p.birthDate ? isoToBR(p.birthDate) : '');
        setBiologicalSex(p.biologicalSex);
        setUsesMedication(p.medication.uses);
        setMedicationDescription(p.medication.description ?? '');
        setHasGoal(p.bpGoal !== null);
        setGoalSystolic(p.bpGoal?.systolic.toString() ?? '');
        setGoalDiastolic(p.bpGoal?.diastolic.toString() ?? '');
        setIsDiabetic(p.isDiabetic);
        setIsSmoker(p.isSmoker);
        setDoctorName(p.doctorName ?? '');
        setLoading(false);
      }
      load();
    }, [])
  );

  async function handleSave() {
    setSaving(true);
    const profile: UserProfile = {
      name: name.trim(),
      birthDate: birthDate.length === 10 ? brToISO(birthDate) : undefined,
      biologicalSex,
      medication: {
        uses: usesMedication,
        description: usesMedication ? medicationDescription.trim() || undefined : undefined,
      },
      bpGoal:
        hasGoal && goalSystolic && goalDiastolic
          ? { systolic: Number(goalSystolic), diastolic: Number(goalDiastolic) }
          : null,
      isDiabetic,
      isSmoker,
      doctorName: doctorName.trim() || undefined,
    };
    try {
      await saveProfile(profile);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2500);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const SEX_OPTIONS: { key: BiologicalSex; label: string }[] = [
    { key: 'male', label: 'Masculino' },
    { key: 'female', label: 'Feminino' },
    { key: 'other', label: 'Outro' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.title}>👤 Meu Perfil</Text>
          <Text style={styles.subtitle}>Informações pessoais de saúde</Text>
        </View>

        {/* Dados pessoais */}
        <Section title="Dados Pessoais">
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nome</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Data de nascimento</Text>
            <TextInput
              style={styles.textInput}
              value={birthDate}
              onChangeText={(text) => setBirthDate(maskBirthDate(text))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={10}
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Sexo biológico</Text>
            <View style={styles.chipsRow}>
              {SEX_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.chip, biologicalSex === opt.key && styles.chipActive]}
                  onPress={() => setBiologicalSex(biologicalSex === opt.key ? undefined : opt.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, biologicalSex === opt.key && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Section>

        {/* Medicamentos */}
        <Section title="Medicamentos">
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Uso anti-hipertensivos ou outros medicamentos</Text>
            <Switch
              value={usesMedication}
              onValueChange={setUsesMedication}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          {usesMedication && (
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Quais medicamentos?</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={medicationDescription}
                onChangeText={setMedicationDescription}
                placeholder="Ex: Losartana 50mg, Anlodipino 5mg..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                maxLength={300}
                textAlignVertical="top"
              />
            </View>
          )}
        </Section>

        {/* Meta de pressão */}
        <Section title="Meta de Pressão">
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Definir meta de pressão (definida pelo médico)</Text>
            <Switch
              value={hasGoal}
              onValueChange={setHasGoal}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          {hasGoal && (
            <View style={styles.goalRow}>
              <View style={styles.goalField}>
                <Text style={styles.fieldLabel}>Sistólica</Text>
                <TextInput
                  style={styles.goalInput}
                  value={goalSystolic}
                  onChangeText={setGoalSystolic}
                  placeholder="120"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              <Text style={styles.goalSeparator}>/</Text>
              <View style={styles.goalField}>
                <Text style={styles.fieldLabel}>Diastólica</Text>
                <TextInput
                  style={styles.goalInput}
                  value={goalDiastolic}
                  onChangeText={setGoalDiastolic}
                  placeholder="80"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
              <Text style={styles.goalUnit}>mmHg</Text>
            </View>
          )}
        </Section>

        {/* Fatores de risco */}
        <Section title="Fatores de Risco Cardiovascular">
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Sou diabético(a)</Text>
            <Switch
              value={isDiabetic}
              onValueChange={setIsDiabetic}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>Sou fumante</Text>
            <Switch
              value={isSmoker}
              onValueChange={setIsSmoker}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </Section>

        {/* Médico */}
        <Section title="Médico Responsável">
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nome do médico (opcional)</Text>
            <TextInput
              style={styles.textInput}
              value={doctorName}
              onChangeText={setDoctorName}
              placeholder="Dr. ..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        </Section>

        {/* Botão salvar */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Salvando...' : '💾 Salvar Perfil'}
          </Text>
        </TouchableOpacity>

        {savedFeedback && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✅ Perfil salvo com sucesso!</Text>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    flexShrink: 1,
  },
  textInput: {
    fontSize: fontSize.md,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
  },
  textInputMultiline: {
    minHeight: 72,
    borderBottomWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.text,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  goalField: {
    flex: 1,
    gap: spacing.xs,
    alignItems: 'center',
  },
  goalInput: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs,
    width: '100%',
  },
  goalSeparator: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  goalUnit: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
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
  successBanner: {
    backgroundColor: colors.normalBg,
    borderWidth: 1,
    borderColor: colors.normal,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  successText: {
    fontSize: fontSize.md,
    color: colors.normal,
    fontWeight: '600',
  },
});
