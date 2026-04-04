import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
