import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { createPulseAnimation } from '../utils/animations';
import { colors } from '../theme';

interface LoadingSkeletonProps extends ViewProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

/**
 * Loading skeleton component with pulse animation
 * Used while data is loading
 */
export function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  ...props
}: LoadingSkeletonProps) {
  const opacity = useRef(createPulseAnimation()).current;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
      {...props}
    />
  );
}

/**
 * Loading skeleton card (simulates a ReadingCard)
 */
export function LoadingCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <LoadingSkeleton width="60%" height={48} />
        <LoadingSkeleton width="40%" height={32} style={{ marginTop: 12 }} />
        <LoadingSkeleton width="70%" height={16} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.cardRight}>
        <LoadingSkeleton width={60} height={16} />
        <LoadingSkeleton width={80} height={32} style={{ marginTop: 8 }} />
        <LoadingSkeleton width={70} height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

/**
 * Loading skeleton for stats display
 */
export function LoadingStatSkeleton() {
  return (
    <View style={styles.statCard}>
      <LoadingSkeleton width="100%" height={48} />
      <LoadingSkeleton width="100%" height={16} style={{ marginTop: 12 }} />
    </View>
  );
}

/**
 * Loading skeleton for list of items
 */
export function LoadingSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingCardSkeleton key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLeft: {
    flex: 1,
    gap: 8,
  },
  cardRight: {
    marginLeft: 24,
    alignItems: 'flex-end',
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
});
