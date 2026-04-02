import React, { useEffect, useRef } from 'react';
import { Animated, Text, TextProps, StyleSheet } from 'react-native';

interface AnimatedNumberProps extends TextProps {
  value: number;
  duration?: number;
  decimals?: number;
}

/**
 * Animated number that counts from 0 to the final value
 * Perfect for displaying BP values, heart rate, etc.
 */
export function AnimatedNumber({
  value,
  duration = 800,
  decimals = 0,
  style,
  ...props
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
  }, [value, duration, animatedValue]);

  const displayValue = animatedValue.interpolate({
    inputRange: [0, value],
    outputRange: [0, value],
  });

  return (
    <Animated.Text
      {...props}
      style={[
        style,
        {
          color: typeof style === 'object' && 'color' in style ? style.color : '#1A1A1A',
        },
      ]}
    >
      {displayValue.interpolate({
        inputRange: [0, value],
        outputRange: ['0', String(value)],
        extrapolate: 'clamp',
      })}
    </Animated.Text>
  );
}

/**
 * Simplified animated number component that uses native driver
 * More performant for frequent updates
 */
export function SimpleAnimatedNumber({
  value,
  duration = 600,
}: {
  value: number;
  duration?: number;
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [value, duration, animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <Animated.Text
      style={[
        styles.number,
        {
          opacity,
        },
      ]}
    >
      {value}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  number: {
    fontSize: 32,
    fontWeight: '900',
  },
});
