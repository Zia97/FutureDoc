import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheKey = (section) => `content_cache_${section}`;
// Coaching and practice share these banks. Avoid reparsing them on every save.
const practiceReads = new Map();
const isPractice = (section) => !section.startsWith('timed_');

export async function getCached(section) {
  if (practiceReads.has(section)) return practiceReads.get(section);
  const read = readCache(section);
  if (isPractice(section)) {
    practiceReads.set(section, read);
    read.then((value) => {
      if (!value && practiceReads.get(section) === read) practiceReads.delete(section);
    });
  }
  return read;
}

async function readCache(section) {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(section));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveCache(section, version, data, { required = false } = {}) {
  try {
    await AsyncStorage.setItem(cacheKey(section), JSON.stringify({ version, data }));
    if (isPractice(section)) practiceReads.set(section, Promise.resolve({ version, data }));
  } catch (error) {
    if (required) throw error;
  }
}

export async function clearCache(section) {
  practiceReads.delete(section);
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
