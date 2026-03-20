import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (section) => `dev_preview_${section}`;

export async function isPreviewEnabled(section) {
  const val = await AsyncStorage.getItem(key(section));
  return val === 'true';
}

export async function setPreviewEnabled(section, enabled) {
  await AsyncStorage.setItem(key(section), enabled ? 'true' : 'false');
}
