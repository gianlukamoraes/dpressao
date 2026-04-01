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

export interface AppSettings {
  userName: string;
  reminderEnabled: boolean;
  reminderTime: string; // HH:00 format
  disclaimerAcceptedAt: string | null;
}
