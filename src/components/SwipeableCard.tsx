import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  View,
  ViewProps,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { spacing, borderRadius, fontSize } from '../theme';
import { hapticWarning } from '../utils/haptics';
import { useTheme } from '../contexts/ThemeContext';

interface SwipeableCardProps extends ViewProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onDeletePress?: () => void;
  deleteLabel?: string;
}

/**
 * Swipeable card that reveals a delete button on swipe
 * Long press also triggers delete
 */
export function SwipeableCard({
  children,
  onDelete,
  onDeletePress,
  deleteLabel = '🗑️ Deletar',
  style,
  ...props
}: SwipeableCardProps) {
  const { colors } = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, { dx }) => {
        // Only allow swiping left (negative dx)
        if (dx < 0) {
          pan.x.setValue(Math.max(dx, -80));
        }
      },
      onPanResponderRelease: (e, { dx, vx }) => {
        // If swiped more than 40px to the left, show delete
        if (dx < -40 || vx < -0.5) {
          Animated.timing(pan.x, {
            toValue: -80,
            duration: 200,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.timing(pan.x, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = async () => {
    await hapticWarning();
    onDelete?.();
    onDeletePress?.();
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Delete button background */}
      <View style={[styles.deleteBackground, { backgroundColor: colors.hypertension2 }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>{deleteLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Swipeable content */}
      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: colors.surface,
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius.md,
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: fontSize.sm,
  },
  content: {},
});
