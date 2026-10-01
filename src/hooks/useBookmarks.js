import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@ucat:bookmarks';
const VALID_SECTIONS = ['vr', 'qr', 'dm', 'sj'];

async function readAll() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAll(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useBookmarks(section) {
  const safeSection = VALID_SECTIONS.includes(section) ? section : null;
  const [map, setMap] = useState({});
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!safeSection) {
      setMap({});
      setLoaded(true);
      return;
    }
    const all = await readAll();
    setMap(all[safeSection] ?? {});
    setLoaded(true);
  }, [safeSection]);

  useEffect(() => {
    reload();
  }, [reload]);

  const isBookmarked = useCallback(
    (questionId) => !!map[String(questionId)],
    [map],
  );

  const toggle = useCallback(
    async (questionId) => {
      if (!safeSection || questionId == null) return;
      const key = String(questionId);
      const all = await readAll();
      const sectionMap = { ...(all[safeSection] ?? {}) };
      if (sectionMap[key]) {
        delete sectionMap[key];
      } else {
        sectionMap[key] = true;
      }
      const next = { ...all, [safeSection]: sectionMap };
      await writeAll(next);
      setMap(sectionMap);
    },
    [safeSection],
  );

  return { bookmarks: map, isBookmarked, toggle, reload, loaded };
}
