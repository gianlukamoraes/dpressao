import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BloodPressureReading } from '../types';
import { colors } from '../theme';

interface BPLineChartProps {
  readings: BloodPressureReading[];
  height?: number;
  width?: number;
}

const DEFAULT_HEIGHT = 300;
const DEFAULT_WIDTH = 100;
const PADDING = 40;
const POINT_RADIUS = 4;

export function BPLineChart({ readings, height = DEFAULT_HEIGHT, width = DEFAULT_WIDTH }: BPLineChartProps) {
  if (readings.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Svg height={height} width={width}>
          <SvgText x={width / 2} y={height / 2} textAnchor="middle" fill={colors.textMuted} fontSize="14">
            Sem dados
          </SvgText>
        </Svg>
      </View>
    );
  }

  const chartWidth = width - 2 * PADDING;
  const chartHeight = height - 2 * PADDING;

  // Get min/max for scaling
  const allValues = readings.flatMap((r) => [r.systolic, r.diastolic]);
  const minValue = Math.min(...allValues, 60);
  const maxValue = Math.max(...allValues, 180);
  const valueRange = maxValue - minValue || 10;

  // Scale functions
  const scaleX = (index: number) => PADDING + (index / Math.max(readings.length - 1, 1)) * chartWidth;
  const scaleY = (value: number) => height - PADDING - ((value - minValue) / valueRange) * chartHeight;

  // Build polyline points
  const systolicPoints = readings
    .map((r, i) => `${scaleX(i)},${scaleY(r.systolic)}`)
    .join(' ');

  const diastolicPoints = readings
    .map((r, i) => `${scaleX(i)},${scaleY(r.diastolic)}`)
    .join(' ');

  // Reference lines (120/80)
  const line120Y = scaleY(120);
  const line80Y = scaleY(80);

  return (
    <View style={[styles.container, { height }]}>
      <Svg height={height} width={width}>
        <Defs>
          <LinearGradient id="systolicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.hypertension2} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={colors.hypertension2} stopOpacity="0.05" />
          </LinearGradient>
          <LinearGradient id="diastolicGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        <Line
          x1={PADDING}
          y1={height - PADDING}
          x2={width - PADDING}
          y2={height - PADDING}
          stroke={colors.border}
          strokeWidth={1}
        />
        <Line
          x1={PADDING}
          y1={PADDING}
          x2={PADDING}
          y2={height - PADDING}
          stroke={colors.border}
          strokeWidth={1}
        />

        {/* Reference lines */}
        <Line
          x1={PADDING}
          y1={line120Y}
          x2={width - PADDING}
          y2={line120Y}
          stroke={colors.hypertension2}
          strokeWidth={1}
          strokeDasharray={[4, 4]}
          opacity={0.5}
        />
        <Line
          x1={PADDING}
          y1={line80Y}
          x2={width - PADDING}
          y2={line80Y}
          stroke={colors.elevated}
          strokeWidth={1}
          strokeDasharray={[4, 4]}
          opacity={0.5}
        />

        {/* Systolic line */}
        <Polyline
          points={systolicPoints}
          fill="none"
          stroke={colors.hypertension2}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Diastolic line */}
        <Polyline
          points={diastolicPoints}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points - Systolic */}
        {readings.map((r, i) => (
          <Circle
            key={`sys-${i}`}
            cx={scaleX(i)}
            cy={scaleY(r.systolic)}
            r={POINT_RADIUS}
            fill={colors.hypertension2}
          />
        ))}

        {/* Data points - Diastolic */}
        {readings.map((r, i) => (
          <Circle
            key={`dia-${i}`}
            cx={scaleX(i)}
            cy={scaleY(r.diastolic)}
            r={POINT_RADIUS}
            fill={colors.primary}
          />
        ))}

        {/* Y-axis labels */}
        <SvgText x={PADDING - 10} y={scaleY(120) + 4} textAnchor="end" fill={colors.textMuted} fontSize="11">
          120
        </SvgText>
        <SvgText x={PADDING - 10} y={scaleY(80) + 4} textAnchor="end" fill={colors.textMuted} fontSize="11">
          80
        </SvgText>
        <SvgText x={PADDING - 10} y={height - PADDING + 4} textAnchor="end" fill={colors.textMuted} fontSize="11">
          {minValue.toFixed(0)}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
  },
});
