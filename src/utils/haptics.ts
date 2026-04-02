import * as Haptics from 'expo-haptics';

/**
 * Light haptic feedback (subtle vibration)
 * Good for: Toggle switches, small interactions
 */
export async function hapticLight() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently fail if haptics not available
  }
}

/**
 * Medium haptic feedback (noticeable vibration)
 * Good for: Button presses, card taps
 */
export async function hapticMedium() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    // Silently fail if haptics not available
  }
}

/**
 * Heavy haptic feedback (strong vibration)
 * Good for: Successful save, important actions
 */
export async function hapticHeavy() {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    // Silently fail if haptics not available
  }
}

/**
 * Success notification (pattern: light-medium)
 * Good for: Successful data save, completion
 */
export async function hapticSuccess() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    // Silently fail if haptics not available
  }
}

/**
 * Warning notification (pattern: medium-heavy)
 * Good for: Delete confirmation, data warning
 */
export async function hapticWarning() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    // Silently fail if haptics not available
  }
}

/**
 * Error notification (pattern: heavy)
 * Good for: Validation errors, failed operations
 */
export async function hapticError() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    // Silently fail if haptics not available
  }
}

/**
 * Selection haptic (for scroll selection)
 * Good for: Picking items, selection feedback
 */
export async function hapticSelection() {
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    // Silently fail if haptics not available
  }
}
