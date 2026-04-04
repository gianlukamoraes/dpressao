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
