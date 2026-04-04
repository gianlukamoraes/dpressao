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
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BiologicalSex, ExamEntry, UserProfile } from '../types';
import { getProfile, saveProfile } from '../storage/user';
import { GlassBackground } from '../components/GlassBackground';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, borderRadius, fontSize } from '../theme';

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

function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

async function pickImage(): Promise<string | null> {
  try {
    // Dynamic import to avoid crashing if expo-image-picker is not installed
    const ImagePicker = await import('expo-image-picker');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão negada', 'Precisamos acessar sua galeria para anexar a foto do exame.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  } catch {
    Alert.alert('Não disponível', 'Para anexar fotos instale o módulo expo-image-picker:\nnpx expo install expo-image-picker');
    return null;
  }
}

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
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
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Inline form for new exam
  const [showExamForm, setShowExamForm] = useState(false);
  const [newExamDate, setNewExamDate] = useState('');
  const [newExamDescription, setNewExamDescription] = useState('');
  const [newExamPhotoUri, setNewExamPhotoUri] = useState<string | undefined>(undefined);

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
        setExams(p.exams ?? []);
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
      exams: exams.length > 0 ? exams : undefined,
    };
    try {
      await saveProfile(profile);
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function handleAddExam() {
    if (!newExamDescription.trim()) {
      Alert.alert('Campo obrigatório', 'Preencha a descrição do exame.');
      return;
    }
    const isoDate = newExamDate.length === 10 ? brToISO(newExamDate) : new Date().toISOString();
    const entry: ExamEntry = {
      id: Date.now().toString(),
      date: isoDate ?? new Date().toISOString(),
      description: newExamDescription.trim(),
      photoUri: newExamPhotoUri,
    };
    setExams((prev) => [entry, ...prev]);
    setNewExamDate('');
    setNewExamDescription('');
    setNewExamPhotoUri(undefined);
    setShowExamForm(false);
  }

  function handleRemoveExam(id: string) {
    Alert.alert('Remover exame', 'Deseja remover este resultado de exame?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => setExams((prev) => prev.filter((e) => e.id !== id)),
      },
    ]);
  }

  async function handlePickPhoto() {
    const uri = await pickImage();
    if (uri) setNewExamPhotoUri(uri);
  }

  const SEX_OPTIONS: { key: BiologicalSex; label: string }[] = [
    { key: 'male', label: 'Masculino' },
    { key: 'female', label: 'Feminino' },
    { key: 'other', label: 'Outro' },
  ];

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>{children}</View>
      </View>
    );
  }

  if (loading) {
    return (
      <GlassBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>👤 Meu Perfil</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Informações pessoais de saúde</Text>
          </View>

          {/* Dados pessoais */}
          <Section title="Dados Pessoais">
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nome</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderBottomColor: colors.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Data de nascimento</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderBottomColor: colors.border }]}
                value={birthDate}
                onChangeText={(text) => setBirthDate(maskDate(text))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={10}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Sexo biológico</Text>
              <View style={styles.chipsRow}>
                {SEX_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.chip,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      biologicalSex === opt.key && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setBiologicalSex(biologicalSex === opt.key ? undefined : opt.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.chipText,
                      { color: colors.textSecondary },
                      biologicalSex === opt.key && { color: colors.text },
                    ]}>
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
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Uso anti-hipertensivos ou outros medicamentos</Text>
              <Switch
                value={usesMedication}
                onValueChange={setUsesMedication}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            {usesMedication && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Quais medicamentos?</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputMultiline, { color: colors.text, borderColor: colors.border }]}
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
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Definir meta de pressão (definida pelo médico)</Text>
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
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Sistólica</Text>
                  <TextInput
                    style={[styles.goalInput, { color: colors.text, borderBottomColor: colors.border }]}
                    value={goalSystolic}
                    onChangeText={setGoalSystolic}
                    placeholder="120"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
                <Text style={[styles.goalSeparator, { color: colors.textMuted }]}>/</Text>
                <View style={styles.goalField}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Diastólica</Text>
                  <TextInput
                    style={[styles.goalInput, { color: colors.text, borderBottomColor: colors.border }]}
                    value={goalDiastolic}
                    onChangeText={setGoalDiastolic}
                    placeholder="80"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
                <Text style={[styles.goalUnit, { color: colors.textMuted }]}>mmHg</Text>
              </View>
            )}
          </Section>

          {/* Fatores de risco */}
          <Section title="Fatores de Risco Cardiovascular">
            <View style={styles.switchRow}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Sou diabético(a)</Text>
              <Switch
                value={isDiabetic}
                onValueChange={setIsDiabetic}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Sou fumante</Text>
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
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nome do médico (opcional)</Text>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderBottomColor: colors.border }]}
                value={doctorName}
                onChangeText={setDoctorName}
                placeholder="Dr. ..."
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>
          </Section>

          {/* Resultados de Exames */}
          <Section title="Resultados de Exames">
            {exams.length === 0 && !showExamForm && (
              <Text style={[styles.emptyExams, { color: colors.textMuted }]}>Nenhum resultado cadastrado.</Text>
            )}

            {exams.map((exam) => (
              <View key={exam.id} style={[styles.examCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <View style={styles.examCardHeader}>
                  <Text style={[styles.examDate, { color: colors.primary }]}>{isoToBR(exam.date)}</Text>
                  <TouchableOpacity onPress={() => handleRemoveExam(exam.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.examRemove}>🗑️</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.examDescription, { color: colors.text }]} numberOfLines={3}>{exam.description}</Text>
                {exam.photoUri && (
                  <Image source={{ uri: exam.photoUri }} style={styles.examThumb} resizeMode="cover" />
                )}
              </View>
            ))}

            {showExamForm && (
              <View style={[styles.examForm, { backgroundColor: colors.background, borderColor: colors.primary }]}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Data do exame</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderBottomColor: colors.border }]}
                  value={newExamDate}
                  onChangeText={(t) => setNewExamDate(maskDate(t))}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={10}
                />
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: spacing.sm }]}>Descrição / Resultado</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputMultiline, { color: colors.text, borderColor: colors.border }]}
                  value={newExamDescription}
                  onChangeText={setNewExamDescription}
                  placeholder="Ex: Colesterol LDL: 140 mg/dL&#10;Glicemia em jejum: 98 mg/dL"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                />
                <TouchableOpacity style={[styles.photoButton, { borderColor: colors.border }]} onPress={handlePickPhoto} activeOpacity={0.8}>
                  <Text style={[styles.photoButtonText, { color: colors.textSecondary }]}>
                    {newExamPhotoUri ? '✅ Foto anexada — trocar' : '📷 Anexar foto do resultado'}
                  </Text>
                </TouchableOpacity>
                {newExamPhotoUri && (
                  <Image source={{ uri: newExamPhotoUri }} style={styles.examThumbPreview} resizeMode="cover" />
                )}
                <View style={styles.examFormActions}>
                  <TouchableOpacity
                    style={[styles.examFormCancel, { borderColor: colors.border }]}
                    onPress={() => {
                      setShowExamForm(false);
                      setNewExamDate('');
                      setNewExamDescription('');
                      setNewExamPhotoUri(undefined);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.examFormCancelText, { color: colors.textMuted }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.examFormConfirm, { backgroundColor: colors.primary }]} onPress={handleAddExam} activeOpacity={0.8}>
                    <Text style={[styles.examFormConfirmText, { color: colors.text }]}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!showExamForm && (
              <TouchableOpacity style={[styles.addExamButton, { borderColor: colors.primary }]} onPress={() => setShowExamForm(true)} activeOpacity={0.8}>
                <Text style={[styles.addExamButtonText, { color: colors.primary }]}>➕ Adicionar Resultado</Text>
              </TouchableOpacity>
            )}
          </Section>

          {/* Botão salvar */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={[styles.saveButtonText, { color: colors.text }]}>
              {saving ? 'Salvando...' : '💾 Salvar Perfil'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
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
  },
  subtitle: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  textInput: {
    fontSize: fontSize.md,
    borderBottomWidth: 1,
    paddingVertical: spacing.xs,
  },
  textInputMultiline: {
    minHeight: 80,
    borderBottomWidth: 0,
    borderWidth: 1,
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
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
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
    textAlign: 'center',
    borderBottomWidth: 2,
    paddingVertical: spacing.xs,
    width: '100%',
  },
  goalSeparator: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: spacing.xs,
  },
  goalUnit: {
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  emptyExams: {
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  examCard: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examDate: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  examRemove: {
    fontSize: fontSize.md,
  },
  examDescription: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  examThumb: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  examForm: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  examThumbPreview: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  photoButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  photoButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  examFormActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  examFormCancel: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  examFormCancelText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  examFormConfirm: {
    flex: 2,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  examFormConfirmText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  addExamButton: {
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addExamButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
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
});
