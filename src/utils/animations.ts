import { Animated, Easing } from 'react-native';

/**
 * Fade-in animation for components
 */
export function createFadeInAnimation(delay: number = 0) {
  const opacity = new Animated.Value(0);

  Animated.timing(opacity, {
    toValue: 1,
    duration: 600,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();

  return opacity;
}

/**
 * Scale-up animation for components (entry effect)
 */
export function createScaleInAnimation(delay: number = 0) {
  const scale = new Animated.Value(0.95);

  Animated.timing(scale, {
    toValue: 1,
    duration: 500,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();

  return scale;
}

/**
 * Slide-up animation (from bottom)
 */
export function createSlideUpAnimation(delay: number = 0) {
  const translateY = new Animated.Value(20);

  Animated.timing(translateY, {
    toValue: 0,
    duration: 500,
    delay,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();

  return translateY;
}

/**
 * Pulse animation (for loading or emphasis)
 */
export function createPulseAnimation() {
  const opacity = new Animated.Value(0.6);

  Animated.loop(
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.6,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  ).start();

  return opacity;
}

/**
 * Shake animation (for errors or emphasis)
 */
export function createShakeAnimation() {
  const translateX = new Animated.Value(0);

  Animated.sequence([
    Animated.timing(translateX, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      toValue: -10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      toValue: 10,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(translateX, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }),
  ]).start();

  return translateX;
}

/**
 * Bounce animation (for emphasis)
 */
export function createBounceAnimation(delay: number = 0) {
  const scale = new Animated.Value(1);

  Animated.sequence([
    Animated.timing(scale, {
      toValue: 1.1,
      duration: 300,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(scale, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]).start();

  return scale;
}

/**
 * Staggered animations for list items
 * Returns animation value based on index
 */
export function getStaggeredDelay(index: number, baseDelay: number = 100): number {
  return index * baseDelay;
}

/**
 * Combined fade + scale animation (common pattern)
 */
export function createFadeScaleInAnimation(delay: number = 0) {
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.95);

  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(scale, {
      toValue: 1,
      duration: 500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]).start();

  return {
    opacity,
    scale,
  };
}
