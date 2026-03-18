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
