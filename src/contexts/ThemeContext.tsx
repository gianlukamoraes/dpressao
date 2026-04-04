import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { colors as classicColors } from '../theme';
import { liquidGlassColors } from '../theme/liquidGlass';
import { getSettings, updateSettings } from '../storage/settings';

type AppTheme = 'classic' | 'liquidGlass';

type ColorsType = typeof classicColors;

interface ThemeContextValue {
  theme: AppTheme;
  isLiquidGlass: boolean;
  colors: ColorsType;
  setTheme: (theme: AppTheme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'classic',
  isLiquidGlass: false,
  colors: classicColors,
  setTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('classic');

  useEffect(() => {
    getSettings().then((s) => {
      if (s.theme === 'liquidGlass') setThemeState('liquidGlass');
    });
  }, []);

  const setTheme = useCallback(async (newTheme: AppTheme) => {
    setThemeState(newTheme);
    await updateSettings({ theme: newTheme });
  }, []);

  const colors = theme === 'liquidGlass'
    ? (liquidGlassColors as unknown as ColorsType)
    : classicColors;

  return (
    <ThemeContext.Provider value={{ theme, isLiquidGlass: theme === 'liquidGlass', colors, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
