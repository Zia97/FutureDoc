import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportError } from '../lib/reportError';

const STREAK_KEY = 'user_streak_v1';

const DEFAULT_STREAK = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
};

function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(a, b) {
  const aDate = new Date(`${a}T00:00:00`);
  const bDate = new Date(`${b}T00:00:00`);
  const ms = bDate.getTime() - aDate.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function getStreak() {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return { ...DEFAULT_STREAK };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STREAK, ...parsed };
  } catch (err) {
    reportError('streakService', err, { level: 'warning', extra: { note: 'getStreak failed' } });
    return { ...DEFAULT_STREAK };
  }
}

export async function recordActivity() {
  try {
    const today = localDateString();
    const current = await getStreak();

    if (current.lastActiveDate === today) {
      return current;
    }

    let nextStreak;
    if (current.lastActiveDate && daysBetween(current.lastActiveDate, today) === 1) {
      nextStreak = current.currentStreak + 1;
    } else {
      nextStreak = 1;
    }

    const next = {
      currentStreak: nextStreak,
      longestStreak: Math.max(current.longestStreak, nextStreak),
      lastActiveDate: today,
    };

    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(next));
    return next;
  } catch (err) {
    reportError('streakService', err, { level: 'warning', extra: { note: 'recordActivity failed' } });
    return await getStreak();
  }
}

export async function getDisplayStreak() {
  const streak = await getStreak();
  if (!streak.lastActiveDate) {
    return { currentStreak: 0, longestStreak: streak.longestStreak };
  }
  const today = localDateString();
  const gap = daysBetween(streak.lastActiveDate, today);
  if (gap > 1) {
    return { currentStreak: 0, longestStreak: streak.longestStreak };
  }
  return { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak };
}

export async function resetStreak() {
  try {
    await AsyncStorage.removeItem(STREAK_KEY);
  } catch (err) {
    reportError('streakService', err, { level: 'warning', extra: { note: 'resetStreak failed' } });
  }
}
