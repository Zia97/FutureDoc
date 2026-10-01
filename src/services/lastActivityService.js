import AsyncStorage from '@react-native-async-storage/async-storage';
import { reportError } from '../lib/reportError';
import { UCAT_SECTIONS, getSectionVisuals as getUcatSectionVisuals } from '../constants/sectionVisuals';

const LAST_ACTIVITY_KEY = 'last_activity_v1';

const SECTION_LABEL = {
  VR: UCAT_SECTIONS.VR.title,
  DM: UCAT_SECTIONS.DM.title,
  QR: UCAT_SECTIONS.QR.title,
  SJ: UCAT_SECTIONS.SJ.title,
};

export function getSectionVisuals(section) {
  const visual = getUcatSectionVisuals(section);

  return {
    icon: visual.icon,
    accentKey: visual.accentKey,
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
