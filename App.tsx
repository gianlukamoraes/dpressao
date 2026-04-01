import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';

import { HomeScreen } from './src/screens/HomeScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { NewReadingScreen } from './src/screens/NewReadingScreen';
import { ReadingDetailScreen } from './src/screens/ReadingDetailScreen';
import { TrendScreen } from './src/screens/TrendScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { DisclaimerScreen } from './src/screens/DisclaimerScreen';
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { RootStackParamList, TabParamList } from './src/types/navigation';
import { colors, fontSize } from './src/theme';
import { getSettings, updateSettings } from './src/storage/settings';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
        {emoji}
      </Text>
    </View>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
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
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Histórico',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Trends"
        component={TrendScreen}
        options={{
          title: 'Tendências',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    checkDisclaimer();
  }, []);

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
    // Loading state
    return null;
  }

  if (!disclaimerAccepted) {
    // Show disclaimer screen
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationEnabled: false,
          }}
        >
          <Stack.Screen
            name="Disclaimer"
            options={{ headerShown: false }}
          >
            {() => <DisclaimerScreen onAccept={handleAcceptDisclaimer} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Show main app
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
        <Stack.Screen
          name="Main"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
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
          options={{
            title: 'Detalhe da Medição',
            headerStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{
            title: 'Política de Privacidade',
            headerStyle: { backgroundColor: colors.background },
          }}
        />
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: 'Sobre',
            headerStyle: { backgroundColor: colors.background },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
