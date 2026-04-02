import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';
import { createFadeScaleInAnimation } from '../utils/animations';

interface AnimatedCardProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  onAnimationEnd?: () => void;
}

/**
 * Card component with fade + scale animation on mount
 * Perfect for list items and important cards
 */
export function AnimatedCard({
  children,
  delay = 0,
  onAnimationEnd,
  style,
  ...props
}: AnimatedCardProps) {
  const animationRef = useRef(createFadeScaleInAnimation(delay));

  useEffect(() => {
    if (onAnimationEnd) {
      const timeout = setTimeout(onAnimationEnd, delay + 600);
      return () => clearTimeout(timeout);
    }
  }, [delay, onAnimationEnd]);

  return (
    <Animated.View
      style={[
        {
          opacity: animationRef.current.opacity,
          transform: [
            {
              scale: animationRef.current.scale,
            },
          ],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

interface AnimatedCardListProps extends ViewProps {
  children: React.ReactNode[];
  baseDelay?: number;
}

/**
 * Container for AnimatedCard items with staggered animation
 */
export function AnimatedCardList({
  children,
  baseDelay = 50,
  ...props
}: AnimatedCardListProps) {
  return (
    <View {...props}>
      {React.Children.map(children, (child, index) => (
        <AnimatedCard key={index} delay={index * baseDelay}>
          {child}
        </AnimatedCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
});
