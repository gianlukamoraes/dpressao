import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

const SETTINGS_KEY = '@dpressao:settings';

const DEFAULT_SETTINGS: AppSettings = {
  userName: '',
  reminderEnabled: false,
  reminderTime: '08:00',
  disclaimerAcceptedAt: null,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return JSON.parse(data);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...updates };
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

export async function resetSettings(): Promise<void> {
  await AsyncStorage.removeItem(SETTINGS_KEY);
}
