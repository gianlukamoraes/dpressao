# Liquid Glass — Sistema de Temas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um segundo tema visual "Liquid Glass" (escuro, carmim, cards translúcidos) selecionável em Ajustes, sem alterar o tema clássico padrão.

**Architecture:** ThemeContext fornece `colors` e `isLiquidGlass` para todo o app via `useTheme()`. Cada componente substitui a importação estática de `colors` pelo hook e move valores de cor de `StyleSheet.create` para inline styles. Dois novos componentes (`GlassBackground`, `GlassView`) encapsulam o visual de vidro. A preferência é salva em `AppSettings.theme`.

**Tech Stack:** React Native + TypeScript + Expo + React Context API + AsyncStorage

---

## File Map

| Arquivo | Ação |
|---|---|
| `src/types/index.ts` | Modificar — `theme` em AppSettings |
| `src/storage/settings.ts` | Modificar — default `theme: 'classic'` |
| `src/theme/liquidGlass.ts` | Criar — tokens do tema LG |
| `src/contexts/ThemeContext.tsx` | Criar — context, provider, `useTheme()` |
| `src/components/GlassBackground.tsx` | Criar — container de tela |
| `src/components/GlassView.tsx` | Criar — card de vidro |
| `App.tsx` | Modificar — ThemeProvider + screenOptions dinâmicos |
| `src/screens/SettingsScreen.tsx` | Modificar — seletor de tema + migração de cores |
| `src/components/BPBadge.tsx` | Modificar — migração de cores |
| `src/components/ReadingCard.tsx` | Modificar — migração de cores |
| `src/components/MedicalDisclaimer.tsx` | Modificar — migração de cores |
| `src/components/AnimatedCard.tsx` | Modificar — migração de cores |
| `src/components/LoadingSkeleton.tsx` | Modificar — migração de cores |
| `src/components/SwipeableCard.tsx` | Modificar — migração de cores |
| `src/components/BPLineChart.tsx` | Modificar — migração de cores |
| `src/screens/HomeScreen.tsx` | Modificar — migração de cores |
| `src/screens/TrendScreen.tsx` | Modificar — migração de cores |
| `src/screens/HistoryScreen.tsx` | Modificar — migração de cores |
| `src/screens/NewReadingScreen.tsx` | Modificar — migração de cores |
| `src/screens/ReadingDetailScreen.tsx` | Modificar — migração de cores |
| `src/screens/ProfileScreen.tsx` | Modificar — migração de cores |
| `src/screens/AboutScreen.tsx` | Modificar — migração de cores |
| `src/screens/DisclaimerScreen.tsx` | Modificar — migração de cores |
| `src/screens/PrivacyPolicyScreen.tsx` | Modificar — migração de cores |

---

## Padrão de Migração de Cores (referência para todas as tasks de migração)

Todo arquivo que hoje faz `import { colors } from '../theme'` deve ser migrado assim:

**Antes:**
```typescript
import { colors, spacing, borderRadius, fontSize } from '../theme';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: borderRadius.md },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
});

function MyComponent() {
  return <View style={styles.card}><Text style={styles.title}>Olá</Text></View>;
}
```

**Depois:**
```typescript
import { spacing, borderRadius, fontSize } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Olá</Text>
    </View>
  );
}

// StyleSheet mantém apenas layout/spacing/borderRadius — SEM cores
const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderWidth: 1, borderRadius: borderRadius.md },
  title: { fontSize: fontSize.xl, fontWeight: '700' },
});
```

**Regras:**
1. Remover `colors` do import estático de `'../theme'`
2. Adicionar `const { colors } = useTheme()` como primeira linha dentro do componente
3. Remover qualquer propriedade de cor de `StyleSheet.create` (backgroundColor, color, borderColor, tintColor, etc.)
4. Adicionar as cores como inline styles: `style={[styles.foo, { color: colors.text }]}`
5. `spacing`, `borderRadius`, `fontSize` continuam no `StyleSheet.create` normalmente

---

## Task 1: Tipos e Settings

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/storage/settings.ts`

- [ ] **Adicionar `theme` ao AppSettings**

Em `src/types/index.ts`, localizar a interface `AppSettings` e adicionar o campo `theme`:

```typescript
export interface AppSettings {
  userName: string;
  reminderEnabled: boolean;
  reminderTime: string;
  disclaimerAcceptedAt: string | null;
  theme?: 'classic' | 'liquidGlass';
}
```

- [ ] **Atualizar DEFAULT_SETTINGS**

Em `src/storage/settings.ts`, adicionar `theme` ao objeto de defaults:

```typescript
const DEFAULT_SETTINGS: AppSettings = {
  userName: '',
  reminderEnabled: false,
  reminderTime: '08:00',
  disclaimerAcceptedAt: null,
  theme: 'classic',
};
```

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/types/index.ts src/storage/settings.ts && git commit -m "feat: adicionar theme ao AppSettings"
```

---

## Task 2: Tokens Liquid Glass

**Files:**
- Create: `src/theme/liquidGlass.ts`

- [ ] **Criar o arquivo com os tokens**

Criar `src/theme/liquidGlass.ts` com o conteúdo completo:

```typescript
import { colors as classicColors } from './index';

export const liquidGlassColors = {
  // Ação principal (igual ao clássico)
  primary: '#16A34A',
  primaryLight: '#22C55E',
  primaryDark: '#15803D',

  // Ações destrutivas (igual ao clássico)
  danger: '#DC3545',
  dangerLight: '#E07080',
  dangerDark: '#A02838',

  // Backgrounds & Surfaces — Carmim Escuro
  background: '#1C0A0A',
  surface: 'rgba(255,255,255,0.10)',
  surfaceLight: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.20)',

  // Halo vermelho (usado no GlassBackground)
  haloColor: 'rgba(220,38,38,0.35)',

  // Text hierarchy
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.65)',
  textMuted: 'rgba(255,255,255,0.40)',

  // Accent (igual ao clássico)
  accent: '#C9A961',
  accentLight: '#E8D4B8',

  // Status colors — inalterados (significado médico)
  normal: '#22C55E',
  normalBg: 'rgba(34,197,94,0.15)',
  elevated: '#FBBF24',
  elevatedBg: 'rgba(251,191,36,0.15)',
  hypertension1: '#FB923C',
  hypertension1Bg: 'rgba(249,115,22,0.15)',
  hypertension2: '#EF4444',
  hypertension2Bg: 'rgba(239,68,68,0.15)',
  crisis: '#A855F7',
  crisisBg: 'rgba(168,85,247,0.15)',

  overlay: 'rgba(0,0,0,0.6)',
} as const;

// Verificação de shape: liquidGlassColors deve ter as mesmas chaves que classicColors
type _ShapeCheck = {
  [K in keyof typeof classicColors]: typeof liquidGlassColors[K];
};
```

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/theme/liquidGlass.ts && git commit -m "feat: tokens de cores do tema Liquid Glass"
```

---

## Task 3: ThemeContext

**Files:**
- Create: `src/contexts/ThemeContext.tsx`

- [ ] **Criar o ThemeContext**

Criar `src/contexts/ThemeContext.tsx`:

```typescript
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
```

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/contexts/ThemeContext.tsx && git commit -m "feat: ThemeContext com suporte a classic e liquidGlass"
```

---

## Task 4: GlassBackground e GlassView

**Files:**
- Create: `src/components/GlassBackground.tsx`
- Create: `src/components/GlassView.tsx`

- [ ] **Criar GlassBackground**

Criar `src/components/GlassBackground.tsx`:

```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface GlassBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function GlassBackground({ children, style }: GlassBackgroundProps) {
  const { isLiquidGlass, colors } = useTheme();

  if (!isLiquidGlass) {
    return (
      <View style={[styles.base, { backgroundColor: colors.background }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.base, { backgroundColor: '#1C0A0A' }, style]}>
      {/* Halo principal — canto superior direito */}
      <View style={styles.halo1} />
      {/* Halo secundário — canto inferior esquerdo */}
      <View style={styles.halo2} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  halo1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(220,38,38,0.30)',
  },
  halo2: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(180,20,20,0.15)',
  },
});
```

- [ ] **Criar GlassView**

Criar `src/components/GlassView.tsx`:

```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { borderRadius } from '../theme';

interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export function GlassView({ children, style }: GlassViewProps) {
  const { isLiquidGlass, colors } = useTheme();

  if (!isLiquidGlass) {
    return (
      <View
        style={[
          styles.base,
          { backgroundColor: colors.surface, borderColor: colors.border },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.base,
        styles.glass,
        style,
      ]}
    >
      {/* Specular highlight — linha branca no topo simulando reflexo de luz */}
      <View style={styles.highlight} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.20)',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.30)',
  },
});
```

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/components/GlassBackground.tsx src/components/GlassView.tsx && git commit -m "feat: GlassBackground e GlassView para o tema Liquid Glass"
```

---

## Task 5: App.tsx — ThemeProvider e screenOptions dinâmicos

**Files:**
- Modify: `App.tsx`

- [ ] **Ler o arquivo atual**

Ler `C:/Github/dpressao/App.tsx` para entender a estrutura atual antes de editar.

- [ ] **Substituir o conteúdo completo**

Reescrever `App.tsx` com o conteúdo abaixo. As mudanças principais são: importar `ThemeProvider` e `useTheme`, envolver `AppContent` com `ThemeProvider`, e tornar `HomeTabs` e `AppContent` dinâmicos via `useTheme()`.

```typescript
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import { HomeScreen } from './src/screens/HomeScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { NewReadingScreen } from './src/screens/NewReadingScreen';
import { ReadingDetailScreen } from './src/screens/ReadingDetailScreen';
import { TrendScreen } from './src/screens/TrendScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { DisclaimerScreen } from './src/screens/DisclaimerScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { RootStackParamList, TabParamList } from './src/types/navigation';
import { fontSize } from './src/theme';
import { getSettings, updateSettings } from './src/storage/settings';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeTabs() {
  const { colors, isLiquidGlass } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isLiquidGlass ? 'rgba(28,10,10,0.95)' : colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: string; inactive: string }> = {
            Home:     { active: 'home',            inactive: 'home-outline' },
            History:  { active: 'time',            inactive: 'time-outline' },
            Trends:   { active: 'stats-chart',     inactive: 'stats-chart-outline' },
            Settings: { active: 'settings',        inactive: 'settings-outline' },
          };
          const icon = icons[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return (
            <Ionicons
              name={(focused ? icon.active : icon.inactive) as any}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     options={{ title: 'Início' }} />
      <Tab.Screen name="History"  component={HistoryScreen}  options={{ title: 'Histórico' }} />
      <Tab.Screen name="Trends"   component={TrendScreen}    options={{ title: 'Tendências' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const { colors } = useTheme();
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    checkDisclaimer();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    const settings = await getSettings();
    if (settings.reminderEnabled) {
      const { hour } = parseTimeString(settings.reminderTime);
      Notifications.cancelAllScheduledNotificationsAsync();
      Notifications.scheduleNotificationAsync({
        content: {
          title: '🫀 Hora de Medir sua Pressão!',
          body: 'Não esqueça de registrar sua medição diária.',
          sound: 'default',
          badge: 1,
        },
        trigger: {
          type: 'daily',
          hour,
          minute: 0,
        },
      });
    }
  };

  const parseTimeString = (timeString: string): { hour: number; minute: number } => {
    const [hourStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    return { hour: isNaN(hour) ? 9 : hour, minute: 0 };
  };

  const checkDisclaimer = async () => {
    const settings = await getSettings();
    setDisclaimerAccepted(!!settings.disclaimerAcceptedAt);
  };

  const handleAcceptDisclaimer = async () => {
    const settings = await getSettings();
    await updateSettings({
      ...settings,
      disclaimerAcceptedAt: new Date().toISOString(),
    });
    setDisclaimerAccepted(true);
  };

  if (disclaimerAccepted === null) {
    return null;
  }

  if (!disclaimerAccepted) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: false }}>
          <Stack.Screen name="Disclaimer" options={{ headerShown: false }}>
            {() => <DisclaimerScreen onAccept={handleAcceptDisclaimer} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700', fontSize: fontSize.lg },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Main" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="NewReading"
          component={NewReadingScreen}
          options={{
            title: 'Nova Medição',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="ReadingDetail"
          component={ReadingDetailScreen}
          options={{ title: 'Detalhe da Medição', headerStyle: { backgroundColor: colors.background } }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Meu Perfil', headerStyle: { backgroundColor: colors.background } }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ title: 'Política de Privacidade', headerStyle: { backgroundColor: colors.background } }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: 'Sobre', headerStyle: { backgroundColor: colors.background } }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add App.tsx && git commit -m "feat: integrar ThemeProvider e screenOptions dinâmicos no App.tsx"
```

---

## Task 6: SettingsScreen — Seletor de Tema + Migração

**Files:**
- Modify: `src/screens/SettingsScreen.tsx`

- [ ] **Ler o arquivo atual**

Ler `C:/Github/dpressao/src/screens/SettingsScreen.tsx` antes de editar.

- [ ] **Adicionar import do useTheme e remover import estático de colors**

Substituir:
```typescript
import { colors, spacing, borderRadius, fontSize } from '../theme';
```
Por:
```typescript
import { spacing, borderRadius, fontSize } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
```

- [ ] **Adicionar `useTheme()` dentro de `SettingsScreen`**

Logo após `const navigation = useNavigation<any>();`, adicionar:
```typescript
const { colors, theme, setTheme } = useTheme();
```

- [ ] **Adicionar seção de Aparência no JSX**

Inserir antes da seção `{/* Seção Perfil */}` (ou como primeira seção após o header):

```tsx
{/* Seção Aparência */}
<View style={styles.section}>
  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>🎨 Aparência</Text>
  <View style={[styles.card, { backgroundColor: colors.surface }]}>
    <Text style={[styles.label, { color: colors.text }]}>Tema Visual</Text>
    <View style={styles.themeRow}>
      <TouchableOpacity
        style={[
          styles.themeChip,
          { borderColor: colors.border, backgroundColor: colors.surfaceLight },
          theme === 'classic' && { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
        ]}
        onPress={() => setTheme('classic')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.themeChipText,
          { color: colors.textSecondary },
          theme === 'classic' && { color: colors.primary },
        ]}>
          ☀️ Visual Clássico
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.themeChip,
          { borderColor: colors.border, backgroundColor: colors.surfaceLight },
          theme === 'liquidGlass' && { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
        ]}
        onPress={() => setTheme('liquidGlass')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.themeChipText,
          { color: colors.textSecondary },
          theme === 'liquidGlass' && { color: colors.primary },
        ]}>
          🌙 Liquid Glass
        </Text>
      </TouchableOpacity>
    </View>
  </View>
</View>
```

- [ ] **Adicionar estilos para os novos elementos**

No `StyleSheet.create`, adicionar:
```typescript
themeRow: {
  flexDirection: 'row',
  gap: spacing.sm,
  marginTop: spacing.xs,
},
themeChip: {
  flex: 1,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderRadius: borderRadius.md,
  borderWidth: 1.5,
  alignItems: 'center',
},
themeChipText: {
  fontSize: fontSize.sm,
  fontWeight: '700',
},
```

- [ ] **Migrar todas as cores para inline styles**

Seguindo o Padrão de Migração definido no topo deste plano:
- Remover cores de `StyleSheet.create`
- Aplicar `{ color: colors.X }` e `{ backgroundColor: colors.X }` como inline styles em cada elemento JSX

Exemplos de elementos que precisam de migração inline neste arquivo:
- `<ScrollView style={styles.container}>` → adicionar `{ backgroundColor: colors.background }`
- `<Text style={styles.title}>` → adicionar `{ color: colors.text }`
- `<Text style={styles.subtitle}>` → adicionar `{ color: colors.textSecondary }`
- `<View style={styles.card}>` → adicionar `{ backgroundColor: colors.surface }`
- `<Text style={styles.label}>` → adicionar `{ color: colors.text }`
- `<Text style={styles.sectionTitle}>` → adicionar `{ color: colors.textSecondary }`
- `<View style={styles.toggleSwitch}>` → usar `{ backgroundColor: reminderEnabled ? colors.primary : colors.border }`
- `<Text style={styles.buttonText}>` → adicionar `{ color: colors.text }`
- `<Text style={styles.dangerButtonText}>` → adicionar `{ color: colors.text }`
- `<Text style={styles.statLabel}>` → adicionar `{ color: colors.textSecondary }`
- `<Text style={styles.statValue}>` → adicionar `{ color: colors.text }`
- `<View style={styles.disclaimerCard}>` → adicionar `{ backgroundColor: colors.hypertension2Bg }`
- `<Text style={styles.disclaimerText}>` → adicionar `{ color: colors.textSecondary }`
- `<View style={styles.linkButton}>` → adicionar `{ backgroundColor: colors.surface, borderColor: colors.border }`
- `<Text style={styles.linkButtonTitle}>` → adicionar `{ color: colors.text }`
- `<Text style={styles.linkButtonSubtitle}>` → adicionar `{ color: colors.textMuted }`
- `<Text style={styles.linkButtonArrow}>` → adicionar `{ color: colors.textMuted }`
- `<View style={styles.divider}>` → adicionar `{ backgroundColor: colors.border }`
- `<View style={styles.timeChip}>` → usar `{ backgroundColor: ..., borderColor: ... }` dinâmico
- `<Text style={styles.timeChipText}>` → usar `{ color: ... }` dinâmico

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/screens/SettingsScreen.tsx && git commit -m "feat: seletor de tema Visual Clássico / Liquid Glass em Ajustes"
```

---

## Task 7: Migrar Componentes Menores

**Files:**
- Modify: `src/components/BPBadge.tsx`
- Modify: `src/components/MedicalDisclaimer.tsx`
- Modify: `src/components/AnimatedCard.tsx`
- Modify: `src/components/LoadingSkeleton.tsx`
- Modify: `src/components/SwipeableCard.tsx`

- [ ] **Ler cada arquivo antes de editar**

Ler cada um dos 5 arquivos para entender a estrutura atual.

- [ ] **Aplicar o Padrão de Migração em cada arquivo**

Para cada arquivo:
1. Substituir `import { colors, ... } from '../theme'` → remover `colors` do import
2. Adicionar `import { useTheme } from '../contexts/ThemeContext'`
3. Adicionar `const { colors } = useTheme()` dentro do componente principal
4. Remover propriedades de cor de `StyleSheet.create`
5. Adicionar cores como inline styles em cada elemento JSX afetado

**Atenção:** `BPBadge` usa `classification.color` e `classification.bgColor` que vêm do `classifyBP()` — esses são dinâmicos e já funcionam corretamente. O que precisa ser migrado são apenas referências diretas a `colors.X`.

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/components/BPBadge.tsx src/components/MedicalDisclaimer.tsx src/components/AnimatedCard.tsx src/components/LoadingSkeleton.tsx src/components/SwipeableCard.tsx && git commit -m "feat: migrar componentes menores para useTheme()"
```

---

## Task 8: Migrar ReadingCard e BPLineChart

**Files:**
- Modify: `src/components/ReadingCard.tsx`
- Modify: `src/components/BPLineChart.tsx`

- [ ] **Ler cada arquivo antes de editar**

- [ ] **Aplicar o Padrão de Migração**

`ReadingCard` provavelmente usa `colors.surface`, `colors.border`, `colors.text`, `colors.textSecondary`, `colors.textMuted` — migrar todos para inline styles.

`BPLineChart` usa importação estática de `colors` de `'../theme'` — aplicar o Padrão de Migração completo: remover do import estático, adicionar `const { colors } = useTheme()` dentro do componente, mover cores para inline styles.

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/components/ReadingCard.tsx src/components/BPLineChart.tsx && git commit -m "feat: migrar ReadingCard e BPLineChart para useTheme()"
```

---

## Task 9: Migrar HomeScreen e TrendScreen

**Files:**
- Modify: `src/screens/HomeScreen.tsx`
- Modify: `src/screens/TrendScreen.tsx`

- [ ] **Ler cada arquivo antes de editar**

- [ ] **Aplicar o Padrão de Migração em HomeScreen**

`HomeScreen` usa `colors.background`, `colors.primary`, `colors.text`, `colors.textSecondary`, `colors.textMuted`, `colors.surface`, `colors.border`, `colors.surfaceLight` e as cores de status via `classifyBP`.

Adicionalmente, envolver o `ScrollView` com `GlassBackground`:
```tsx
import { GlassBackground } from '../components/GlassBackground';

// Na render:
return (
  <GlassBackground>
    <ScrollView ...>
      ...
    </ScrollView>
  </GlassBackground>
);
```

- [ ] **Aplicar o Padrão de Migração em TrendScreen**

`TrendScreen` usa importação estática de `colors` de `'../theme'` — aplicar o Padrão de Migração completo. Também envolver o `ScrollView` com `GlassBackground`.

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/screens/HomeScreen.tsx src/screens/TrendScreen.tsx && git commit -m "feat: migrar HomeScreen e TrendScreen para useTheme() + GlassBackground"
```

---

## Task 10: Migrar HistoryScreen e NewReadingScreen

**Files:**
- Modify: `src/screens/HistoryScreen.tsx`
- Modify: `src/screens/NewReadingScreen.tsx`

- [ ] **Ler cada arquivo antes de editar**

- [ ] **Aplicar o Padrão de Migração**

Migrar todas as referências a `colors` para inline styles via `useTheme()`. Envolver os ScrollViews com `GlassBackground`.

`NewReadingScreen` usa cores nos chips de sintomas e no formulário — garantir que todas as cores dinâmicas dos chips usem `colors.primary` e `colors.border` do hook.

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/screens/HistoryScreen.tsx src/screens/NewReadingScreen.tsx && git commit -m "feat: migrar HistoryScreen e NewReadingScreen para useTheme()"
```

---

## Task 11: Migrar ReadingDetailScreen e ProfileScreen

**Files:**
- Modify: `src/screens/ReadingDetailScreen.tsx`
- Modify: `src/screens/ProfileScreen.tsx`

- [ ] **Ler cada arquivo antes de editar**

- [ ] **Aplicar o Padrão de Migração**

Migrar todas as referências a `colors` para inline styles via `useTheme()`. Envolver com `GlassBackground`.

`ProfileScreen` tem seção de exames com foto — garantir que os campos de texto e bordas usem cores do tema.

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/screens/ReadingDetailScreen.tsx src/screens/ProfileScreen.tsx && git commit -m "feat: migrar ReadingDetailScreen e ProfileScreen para useTheme()"
```

---

## Task 12: Migrar AboutScreen, DisclaimerScreen e PrivacyPolicyScreen

**Files:**
- Modify: `src/screens/AboutScreen.tsx`
- Modify: `src/screens/DisclaimerScreen.tsx`
- Modify: `src/screens/PrivacyPolicyScreen.tsx`

- [ ] **Ler cada arquivo antes de editar**

- [ ] **Aplicar o Padrão de Migração**

Migrar todas as referências a `colors` para inline styles via `useTheme()`. Envolver com `GlassBackground`.

`DisclaimerScreen` tem um callback `onAccept` — manter a assinatura da prop, apenas migrar as cores.

- [ ] **Commit**

```bash
cd C:/Github/dpressao && git add src/screens/AboutScreen.tsx src/screens/DisclaimerScreen.tsx src/screens/PrivacyPolicyScreen.tsx && git commit -m "feat: migrar AboutScreen, DisclaimerScreen e PrivacyPolicyScreen para useTheme()"
```

---

## Task 13: Verificação Manual

- [ ] Abrir o app — tema padrão "Visual Clássico" ativo, visual idêntico ao atual
- [ ] Ir em Ajustes → 🎨 Aparência → selecionar "🌙 Liquid Glass"
- [ ] Todas as telas mudam para fundo carmim escuro + cards translúcidos imediatamente
- [ ] Tab bar fica com fundo escuro translúcido
- [ ] Header das telas (navegação stack) fica escuro
- [ ] Fechar e reabrir o app — tema Liquid Glass persiste
- [ ] Selecionar "☀️ Visual Clássico" — app retorna ao visual original
- [ ] Fechar e reabrir — tema Clássico persiste
- [ ] Verificar badges de status (Normal / Hipertensão / Crise) — cores médicas inalteradas em ambos os temas
- [ ] Navegar por todas as telas em ambos os temas verificando que nenhuma tela ficou "quebrada"
