import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import {
  createFadeInAnimation,
  createScaleInAnimation,
  createSlideUpAnimation,
  createFadeScaleInAnimation,
} from '../utils/animations';

type AnimationType = 'fadeIn' | 'scaleIn' | 'slideUp' | 'fadeScale';

interface UseAnimationOnMountOptions {
  type: AnimationType;
  delay?: number;
  duration?: number;
}

/**
 * Hook for automatically playing animations on component mount
 */
export function useAnimationOnMount(options: UseAnimationOnMountOptions) {
  const animationRef = useRef<Animated.Value | { opacity: Animated.Value; scale: Animated.Value }>(null);

  useEffect(() => {
    const { type, delay = 0 } = options;

    switch (type) {
      case 'fadeIn':
        animationRef.current = createFadeInAnimation(delay);
        break;
      case 'scaleIn':
        animationRef.current = createScaleInAnimation(delay);
        break;
      case 'slideUp':
        animationRef.current = createSlideUpAnimation(delay);
        break;
      case 'fadeScale':
        animationRef.current = createFadeScaleInAnimation(delay);
        break;
    }
  }, [options]);

  return animationRef.current;
}

/**
 * Hook for staggered animations in lists
 */
export function useStaggeredAnimation(
  index: number,
  type: AnimationType = 'fadeScale',
  baseDelay: number = 100
) {
  const animation = useAnimationOnMount({
    type,
    delay: index * baseDelay,
  });

  return animation;
}
