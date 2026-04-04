export interface ExamEntry {
  id: string;
  date: string;         // ISO string
  description: string;  // texto livre (ex: "Colesterol LDL: 140 mg/dL")
  photoUri?: string;    // URI local da imagem
  photoBase64?: string; // base64 para embed no PDF
}

export interface BloodPressureReading {
  id: string;
  systolic: number;    // Pressão sistólica (mmHg)
  diastolic: number;   // Pressão diastólica (mmHg)
  pulse: number;       // Pulso (bpm)
  date: string;        // ISO string
  note?: string;       // Observação opcional
  symptoms?: string[]; // Sintomas registrados no momento da medição
}

export type BPCategory =
  | 'normal'
  | 'elevated'
  | 'hypertension1'
  | 'hypertension2'
  | 'crisis';

export interface BPClassification {
  category: BPCategory;
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
  description: string;
}

export interface AppSettings {
  userName: string;
  reminderEnabled: boolean;
  reminderTime: string; // HH:00 format
  disclaimerAcceptedAt: string | null;
}

export type BiologicalSex = 'male' | 'female' | 'other';

export interface UserProfile {
  name: string;
  birthDate?: string;
  biologicalSex?: BiologicalSex;
  medication: { uses: boolean; description?: string };
  bpGoal: { systolic: number; diastolic: number } | null;
  isDiabetic: boolean;
  isSmoker: boolean;
  doctorName?: string;
  exams?: ExamEntry[];
}
