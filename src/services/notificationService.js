import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { reportError } from '../lib/reportError';

const CHANNEL_ID = 'daily-reminder';
const IDS_KEY = 'daily_reminder_ids_v2';
const OLD_ID_KEY = 'daily_reminder_id_v1';
const DEVICE_TOKEN_KEY = 'registered_push_token_v1';
const MESSAGES = [
  ['Keep improving for your exam!', 'A short UCAT session today can make a real difference.'],
  ['Keep your study streak going', 'Answer a few questions today and stay on track.'],
  ['Your future self will thank you', 'Make a little progress towards your UCAT goal today.'],
  ['One session at a time', 'Keep building your confidence for exam day.'],
  ['Ready for a quick practice?', 'A few focused minutes can strengthen your skills.'],
  ['Keep the momentum going', 'Your next UCAT practice session is waiting.'],
  ['Show up for your goal today', 'Even a short practice session counts.'],
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Study reminders', importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250], lightColor: '#1F6FEB',
  });
}

export async function getPermissionStatus() {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ? 'granted' : settings.status;
}

export async function requestPermission() {
  await ensureChannel();
  if (await getPermissionStatus() === 'granted') return 'granted';
  const result = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: false } });
  return result.granted || result.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ? 'granted' : result.status;
}

export async function getNotificationPreferences(userId) {
  const { data, error } = await supabase.from('notification_preferences')
    .select('streak_reminders,forum_replies').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return { streak_reminders: !!data?.streak_reminders, forum_replies: !!data?.forum_replies };
}

async function deviceToken() {
  if (Platform.OS === 'web') return null;
  // Android remote push requires a Firebase config baked into the native build.
  // Local scheduled reminders do not, so do not let missing FCM block them.
  if (Platform.OS === 'android' && !Constants.expoConfig?.android?.googleServicesFile) return null;
  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) throw new Error('Missing Expo project ID');
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

async function registerDevice(userId) {
  const token = await deviceToken();
  if (!token) return;
  const cached = JSON.parse(await AsyncStorage.getItem(DEVICE_TOKEN_KEY) || 'null');
  if (cached?.userId === userId && cached.token === token && Date.now() - cached.registeredAt < 24 * 60 * 60 * 1000) return;
  const { error } = await supabase.from('notification_devices').upsert(
    { token, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'token' },
  );
  if (error) throw error;
  await AsyncStorage.setItem(DEVICE_TOKEN_KEY, JSON.stringify({ userId, token, registeredAt: Date.now() }));
}

export async function removeDevice(userId) {
  try {
    if (!userId) return;
    const cached = JSON.parse(await AsyncStorage.getItem(DEVICE_TOKEN_KEY) || 'null');
    if (cached?.userId === userId) {
      await supabase.from('notification_devices').delete().eq('token', cached.token).eq('user_id', userId);
    }
    if (cached?.userId === userId) await AsyncStorage.removeItem(DEVICE_TOKEN_KEY);
  } catch (error) {
    reportError('notificationService', error, { level: 'warning', extra: { note: 'removeDevice failed' } });
  }
}

export async function cancelDailyReminder() {
  try {
    const entries = await AsyncStorage.multiGet([OLD_ID_KEY, IDS_KEY]);
    const ids = [entries[0][1], ...JSON.parse(entries[1][1] || '[]')].filter(Boolean);
    await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)));
    await AsyncStorage.multiRemove([OLD_ID_KEY, IDS_KEY]);
  } catch (error) {
    reportError('notificationService', error, { level: 'warning', extra: { note: 'cancelDailyReminder failed' } });
    throw error;
  }
}

export async function scheduleDailyReminder() {
  if (await getPermissionStatus() !== 'granted') return;
  await ensureChannel();
  await cancelDailyReminder();
  const ids = [];
  try {
    for (let weekday = 1; weekday <= 7; weekday++) {
      const [title, body] = MESSAGES[weekday - 1];
      ids.push(await Notifications.scheduleNotificationAsync({
        content: { title, body, data: { type: 'streak' }, ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}) },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour: 19, minute: 0 },
      }));
    }
    await AsyncStorage.setItem(IDS_KEY, JSON.stringify(ids));
  } catch (error) {
    await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
    reportError('notificationService', error, { level: 'warning', extra: { note: 'scheduleDailyReminder failed' } });
    throw error;
  }
}

export async function refreshNotifications(userId) {
  try {
    if (!userId) { await cancelDailyReminder(); return; }
    const preferences = await getNotificationPreferences(userId);
    if (await getPermissionStatus() !== 'granted') {
      await cancelDailyReminder();
      await removeDevice(userId);
      return;
    }
    if (preferences.streak_reminders || preferences.forum_replies) await scheduleDailyReminder();
    else await cancelDailyReminder();
    if (preferences.forum_replies) {
      try { await registerDevice(userId); }
      catch (error) {
        reportError('notificationService', error, { level: 'warning', extra: { note: 'push registration failed' } });
      }
    }
    else await removeDevice(userId);
  } catch (error) {
    reportError('notificationService', error, { level: 'warning', extra: { note: 'refresh failed' } });
  }
}

export async function setNotificationsEnabled(userId, enabled) {
  if (enabled && await requestPermission() !== 'granted') throw new Error('Notifications are disabled in your device settings.');
  if (enabled) await scheduleDailyReminder();
  const { error } = await supabase.from('notification_preferences').upsert(
    { user_id: userId, streak_reminders: enabled, forum_replies: enabled, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
  if (error) {
    if (enabled) await cancelDailyReminder();
    throw error;
  }
  if (enabled) {
    try { await registerDevice(userId); }
    catch (pushError) {
      reportError('notificationService', pushError, { level: 'warning', extra: { note: 'push registration failed' } });
    }
  } else {
    await cancelDailyReminder();
    await removeDevice(userId);
  }
}
