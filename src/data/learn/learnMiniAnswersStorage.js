import AsyncStorage from '@react-native-async-storage/async-storage';

import { LEARN_MINI_ANSWERS_KEY } from './learningStorageKeys';

// Storage shape:
// {
//   [lessonId]: {
//     [stepIndex]: { selectedIndex, isCorrect, answeredAt }
//   }
// }

async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(LEARN_MINI_ANSWERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

export async function loadMiniAnswersForLesson(lessonId) {
  if (!lessonId) return {};
  const all = await readAll();
  const forLesson = all[lessonId];
  return forLesson && typeof forLesson === 'object' ? forLesson : {};
}

export async function saveMiniAnswer(lessonId, stepIndex, { selectedIndex, isCorrect }) {
  if (!lessonId || stepIndex == null) return;
  const all = await readAll();
  const forLesson = all[lessonId] && typeof all[lessonId] === 'object' ? all[lessonId] : {};
  // First answer wins — the UI also locks after the first selection, so don't overwrite.
  if (forLesson[stepIndex]) return;
  const next = {
    ...all,
    [lessonId]: {
      ...forLesson,
      [stepIndex]: {
        selectedIndex,
        isCorrect,
        answeredAt: new Date().toISOString(),
      },
    },
  };
  try {
    await AsyncStorage.setItem(LEARN_MINI_ANSWERS_KEY, JSON.stringify(next));
  } catch (_) {
    // best-effort local cache; silent on failure (matches existing learn-storage pattern)
  }
}
