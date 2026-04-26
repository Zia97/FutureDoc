import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportError } from '../lib/reportError';

const LAST_ACTIVITY_KEY = 'last_activity_v1';

const SECTION_LABEL = {
  VR: 'Verbal Reasoning',
  DM: 'Decision Making',
  QR: 'Quantitative Reasoning',
  SJ: 'Situational Judgement',
};

const SECTION_ICON = {
  VR: 'book',
  DM: 'person-cog',
  QR: 'calculator',
  SJ: 'stethoscope',
};

const SECTION_ACCENT_KEY = {
  VR: 'blue',
  DM: 'teal',
  QR: 'purple',
  SJ: 'mint',
};

export function getSectionVisuals(section) {
  return {
    icon: SECTION_ICON[section] ?? 'target',
    accentKey: SECTION_ACCENT_KEY[section] ?? 'blue',
  };
}

const PRACTICE_LIST_ROUTE = {
  VR: 'VRQuestionList',
  DM: 'DMQuestionList',
  QR: 'QRQuestionList',
  SJ: 'SJScenarioList',
};

export async function setLastActivity(activity) {
  try {
    const payload = { ...activity, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, JSON.stringify(payload));
  } catch (err) {
    reportError('lastActivityService', err, { level: 'warning', extra: { note: 'setLastActivity failed' } });
  }
}

export async function getLastActivity() {
  try {
    const raw = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    reportError('lastActivityService', err, { level: 'warning', extra: { note: 'getLastActivity failed' } });
    return null;
  }
}

export async function clearLastActivity() {
  try {
    await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch (err) {
    reportError('lastActivityService', err, { level: 'warning', extra: { note: 'clearLastActivity failed' } });
  }
}

export function describeLastActivity(activity) {
  if (!activity || !activity.section) return null;
  const sectionLabel = SECTION_LABEL[activity.section] ?? activity.section;
  if (activity.kind === 'practice') {
    return { sectionLabel, detail: 'Practice questions' };
  }
  if (activity.kind === 'timedList') {
    return { sectionLabel, detail: 'Timed tests' };
  }
  return { sectionLabel, detail: '' };
}

export function getResumeNavTarget(activity) {
  if (!activity || !activity.section) return null;
  if (activity.kind === 'practice') {
    const route = PRACTICE_LIST_ROUTE[activity.section];
    if (!route) return null;
    return { screen: route, params: {} };
  }
  if (activity.kind === 'timedList') {
    return {
      screen: 'TimedTestList',
      params: { section: activity.section, title: SECTION_LABEL[activity.section] ?? activity.section },
    };
  }
  return null;
}
