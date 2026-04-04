import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { BloodPressureReading } from '../types';
import { spacing, borderRadius, fontSize } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface TooltipItem {
  value: number;
  label?: string;
}

interface BPLineChartProps {
  readings: BloodPressureReading[];
  showSystolic?: boolean;
  showDiastolic?: boolean;
  showPulse?: boolean;
  goalSystolic?: number;
  goalDiastolic?: number;
}

export function BPLineChart({
  readings,
  showSystolic = true,
  showDiastolic = true,
  showPulse = true,
  goalSystolic,
  goalDiastolic,
}: BPLineChartProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const chartWidth = width - spacing.lg * 4;

  // Chart: oldest → newest (left to right)
  const { systolicData, diastolicData, pulseData } = useMemo(() => {
    const sortedReadings = [...readings].reverse();
    const step = Math.max(1, Math.floor(sortedReadings.length / 5));

    const makeData = (getValue: (r: BloodPressureReading) => number) =>
      sortedReadings.map((r, i) => ({
        value: getValue(r),
        label:
          i % step === 0
            ? new Date(r.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })
            : '',
      }));

    return {
      systolicData: makeData((r) => r.systolic),
      diastolicData: makeData((r) => r.diastolic),
      pulseData: makeData((r) => r.pulse),
    };
  }, [readings]);

  if (readings.length === 0) {
    return (
      <View style={[styles.container, styles.empty, { backgroundColor: colors.surface }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sem dados para exibir</Text>
      </View>
    );
  }

  const TRANSPARENT = 'transparent';

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LineChart
        data={systolicData}
        data2={diastolicData}
        data3={pulseData}
        color={showSystolic ? colors.hypertension2 : TRANSPARENT}
        color2={showDiastolic ? colors.primary : TRANSPARENT}
        color3={showPulse ? colors.normal : TRANSPARENT}
        thickness={2}
        thickness2={2}
        thickness3={2}
        dataPointsColor={showSystolic ? colors.hypertension2 : TRANSPARENT}
        dataPointsColor2={showDiastolic ? colors.primary : TRANSPARENT}
        dataPointsColor3={showPulse ? colors.normal : TRANSPARENT}
        dataPointsRadius={4}
        hideDataPoints={!showSystolic}
        hideDataPoints2={!showDiastolic}
        hideDataPoints3={!showPulse}
        width={chartWidth}
        height={220}
        curved
        initialSpacing={8}
        endSpacing={8}
        yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
        yAxisColor={colors.border}
        xAxisColor={colors.border}
        rulesColor={colors.border}
        rulesType="solid"
        referenceLine1={!!goalSystolic}
        referenceLine1Position={goalSystolic ?? 0}
        referenceLine1Config={{
          color: colors.hypertension2,
          dashWidth: 5,
          dashGap: 5,
          thickness: 1,
          opacity: 0.6,
          labelText: goalSystolic ? `Meta ${goalSystolic}` : '',
          labelTextStyle: { color: colors.hypertension2, fontSize: 9 },
        }}
        referenceLine2={!!goalDiastolic}
        referenceLine2Position={goalDiastolic ?? 0}
        referenceLine2Config={{
          color: colors.primary,
          dashWidth: 5,
          dashGap: 5,
          thickness: 1,
          opacity: 0.6,
          labelText: goalDiastolic ? `Meta ${goalDiastolic}` : '',
          labelTextStyle: { color: colors.primary, fontSize: 9 },
        }}
        pointerConfig={{
          pointerStripHeight: 200,
          pointerStripColor: colors.border,
          pointerStripWidth: 1,
          pointerColor: colors.textSecondary,
          radius: 5,
          pointerLabelWidth: 120,
          pointerLabelHeight: 72,
          autoAdjustPointerLabelPosition: true,
          pointerLabelComponent: (items: TooltipItem[]) => {
            const sys = items[0]?.value;
            const dia = items[1]?.value;
            const pul = items[2]?.value;
            return (
              <View style={[styles.tooltip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {showSystolic && sys !== undefined && (
                  <Text style={[styles.tooltipLine, { color: colors.hypertension2 }]}>
                    SIS: {sys} mmHg
                  </Text>
                )}
                {showDiastolic && dia !== undefined && (
                  <Text style={[styles.tooltipLine, { color: colors.primary }]}>
                    DIA: {dia} mmHg
                  </Text>
                )}
                {showPulse && pul !== undefined && (
                  <Text style={[styles.tooltipLine, { color: colors.normal }]}>
                    PUL: {pul} bpm
                  </Text>
                )}
              </View>
            );
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  empty: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
  },
  tooltip: {
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    borderWidth: 1,
    gap: 2,
  },
  tooltipLine: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
