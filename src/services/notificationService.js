import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportError } from '../lib/reportError';
import { getDisplayStreak } from './streakService';

const CHANNEL_ID = 'daily-reminder';
const REMINDER_HOUR = 19;
const REMINDER_MINUTE = 0;
const SCHEDULED_ID_KEY = 'daily_reminder_id_v1';

let channelEnsured = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureChannel() {
  if (Platform.OS !== 'android' || channelEnsured) return;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily study reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1F6FEB',
    });
    channelEnsured = true;
  } catch (err) {
    reportError('notificationService', err, { level: 'warning', extra: { note: 'ensureChannel failed' } });
  }
}

export async function getPermissionStatus() {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings.status;
  } catch (err) {
    reportError('notificationService', err, { level: 'warning', extra: { note: 'getPermissionStatus failed' } });
    return 'undetermined';
  }
}

export async function requestPermission() {
  try {
    await ensureChannel();
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === 'granted') return 'granted';
    const result = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: false },
    });
    return result.status;
  } catch (err) {
    reportError('notificationService', err, { level: 'warning', extra: { note: 'requestPermission failed' } });
    return 'undetermined';
  }
}

function buildReminderContent(currentStreak) {
  if (currentStreak > 0) {
    return {
      title: `Keep your ${currentStreak}-day streak alive`,
      body: 'A few questions a day keeps your UCAT score climbing.',
    };
  }
  return {
    title: 'Time to study',
    body: 'Start a new streak today — just 5 questions to begin.',
  };
}

export async function scheduleDailyReminder() {
  try {
    const status = await getPermissionStatus();
    if (status !== 'granted') return null;

    await ensureChannel();
    await cancelDailyReminder();

    const { currentStreak } = await getDisplayStreak();
    const content = buildReminderContent(currentStreak);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        sound: null,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: REMINDER_HOUR,
        minute: REMINDER_MINUTE,
      },
    });

    await AsyncStorage.setItem(SCHEDULED_ID_KEY, id);
    return id;
  } catch (err) {
    reportError('notificationService', err, { level: 'warning', extra: { note: 'scheduleDailyReminder failed' } });
    return null;
  }
}

export async function cancelDailyReminder() {
  try {
    const existingId = await AsyncStorage.getItem(SCHEDULED_ID_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId).catch(() => {});
      await AsyncStorage.removeItem(SCHEDULED_ID_KEY);
    }
  } catch (err) {
    reportError('notificationService', err, { level: 'warning', extra: { note: 'cancelDailyReminder failed' } });
  }
}

export async function refreshDailyReminder() {
  const status = await getPermissionStatus();
  if (status !== 'granted') return;
  await scheduleDailyReminder();
}
