import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to request notification permissions:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function getNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Failed to get notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a daily reminder notification
 * @param hour - Hour in 24-hour format (0-23)
 * @param minute - Minute (0-59)
 * @returns notification ID
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number = 0
): Promise<string | null> {
  try {
    const hasPermission = await getNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return null;
    }

    // Cancel existing reminder
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🫀 Hora de Medir sua Pressão!',
        body: 'Não esqueça de registrar sua medição diária.',
        sound: 'default',
        badge: 1,
      },
      trigger: {
        type: 'daily',
        hour,
        minute,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule reminder:', error);
    return null;
  }
}

/**
 * Cancel all scheduled reminders
 */
export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to cancel reminders:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
}

/**
 * Parse time string in HH:00 format to hour
 */
export function parseTimeString(timeString: string): { hour: number; minute: number } {
  const [hourStr] = timeString.split(':');
  const hour = parseInt(hourStr, 10);
  return { hour: isNaN(hour) ? 9 : hour, minute: 0 };
}

/**
 * Format hour to HH:00 string
 */
export function formatTimeString(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}
