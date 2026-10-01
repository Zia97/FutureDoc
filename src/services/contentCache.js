import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheKey = (section) => `content_cache_${section}`;

export async function getCached(section) {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(section));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveCache(section, version, data) {
  try {
    await AsyncStorage.setItem(cacheKey(section), JSON.stringify({ version, data }));
  } catch {
    // Silent fail — next launch will retry
  }
}

export async function clearCache(section) {
  try {
    await AsyncStorage.removeItem(cacheKey(section));
  } catch {
    // Silent fail
  }
}

export async function clearAllContentCaches() {
  const sections = [
    'verbal_reasoning',
    'decision_making',
    'quantitative_reasoning',
    'situational_judgement',
    'timed_verbal_reasoning',
    'timed_decision_making',
    'timed_quantitative_reasoning',
    'timed_situational_judgement',
  ];
  await Promise.all(sections.map(clearCache));
}
