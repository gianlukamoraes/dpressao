import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, colorsDark } from '../theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof colors;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@dpressao_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);
  const systemColorScheme = useColorScheme();

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Update isDark based on mode and system preference
  useEffect(() => {
    if (mode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(mode === 'dark');
    }
  }, [mode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const savedMode = (await AsyncStorage.getItem(THEME_STORAGE_KEY)) as ThemeMode | null;
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setMode(savedMode);
      } else {
        setMode('system');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      setMode('system');
    }
  };

  const setTheme = async (newMode: ThemeMode) => {
    try {
      setMode(newMode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const themeColors = isDark ? colorsDark : colors;

  const value: ThemeContextType = {
    mode,
    isDark,
    colors: themeColors,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to use theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
