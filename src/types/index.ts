export interface BloodPressureReading {
  id: string;
  systolic: number;    // Pressão sistólica (mmHg)
  diastolic: number;   // Pressão diastólica (mmHg)
  pulse: number;       // Pulso (bpm)
  date: string;        // ISO string
  note?: string;       // Observação opcional
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

export type BiologicalSex = 'male' | 'female' | 'other';

export interface MedicationInfo {
  uses: boolean;
  description?: string;
}

export interface BPGoal {
  systolic: number;
  diastolic: number;
}

export interface UserProfile {
  name: string;
  birthDate?: string;
  biologicalSex?: BiologicalSex;
  medication: MedicationInfo;
  bpGoal: BPGoal | null;
  isDiabetic: boolean;
  isSmoker: boolean;
  doctorName?: string;
}
