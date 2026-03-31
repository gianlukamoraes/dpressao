import AsyncStorage from '@react-native-async-storage/async-storage';
import { BloodPressureReading } from '../types';

const STORAGE_KEY = '@dpressao:readings';

export async function getReadings(): Promise<BloodPressureReading[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const readings: BloodPressureReading[] = JSON.parse(data);
    // Mais recente primeiro
    return readings.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
}

export async function saveReading(
  reading: Omit<BloodPressureReading, 'id'>
): Promise<BloodPressureReading> {
  const readings = await getReadings();
  const newReading: BloodPressureReading = {
    ...reading,
    id: Date.now().toString(),
  };
  const updated = [newReading, ...readings];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newReading;
}

export async function deleteReading(id: string): Promise<void> {
  const readings = await getReadings();
  const updated = readings.filter((r) => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export async function updateReading(
  id: string,
  data: Partial<Omit<BloodPressureReading, 'id'>>
): Promise<void> {
  const readings = await getReadings();
  const updated = readings.map((r) => (r.id === id ? { ...r, ...data } : r));
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
