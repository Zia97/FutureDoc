import { db } from '../lib/dbQueries';
import { withRetry } from '../lib/withRetry';
import { getCached, saveCache } from './contentCache';
import { mapPassages, mapQuestions, mapSets, mapScenarios } from '../lib/practiceContent';

export const PRACTICE_BANKS = [
  { section: 'verbal_reasoning', label: 'Verbal Reasoning', fetch: 'fetchAllVRPassagesPaginated', map: mapPassages },
  { section: 'decision_making', label: 'Decision Making', fetch: 'fetchAllDMQuestionsPaginated', map: mapQuestions },
  { section: 'quantitative_reasoning', label: 'Quantitative Reasoning', fetch: 'fetchAllQRSetsPaginated', map: mapSets },
  { section: 'situational_judgement', label: 'Situational Judgement', fetch: 'fetchAllSJScenariosPaginated', map: mapScenarios },
];
const downloads = new Map();
export const hasPracticeBank = (cache) => cache?.version != null && cache?.data?.length > 0;

// Every consumer shares one version check/download/write per bank. A failed
// refresh leaves the last complete bank available for offline use.
export function syncPracticeContent(section, onProgress) {
  const bank = PRACTICE_BANKS.find((entry) => entry.section === section);
  if (!bank) return Promise.reject(new Error('Unknown question bank'));
  let task = downloads.get(section);
  if (!task) {
    task = { listeners: new Set(), progress: null };
    const emit = (progress) => {
      task.progress = progress;
      task.listeners.forEach((listener) => listener(progress));
    };
    task.promise = Promise.resolve().then(async () => {
      const cached = await getCached(section);
      let { version } = await withRetry(() => db.getContentVersion(section));
      if (hasPracticeBank(cached) && cached.version === version) return cached;
      for (let attempt = 0; attempt < 2; attempt++) {
        let loaded = 0;
        emit({ loaded, total: null });
        const raw = await db[bank.fetch](() => emit({ loaded: ++loaded, total: null }));
        const latest = await db.getContentVersion(section, { force: true });
        if (latest.version !== version) { version = latest.version; continue; }
        const data = bank.map(raw);
        if (!data.length) throw new Error('Questions are unavailable. Please try again.');
        // Setup must not report success if the device could not store the bank.
        await saveCache(section, version, data, { required: true });
        return { version, data };
      }
      throw new Error('Questions are being updated. Please try again.');
    });
    downloads.set(section, task);
    task.promise.finally(() => { if (downloads.get(section) === task) downloads.delete(section); }).catch(() => {});
  }
  if (onProgress) {
    task.listeners.add(onProgress);
    if (task.progress) onProgress(task.progress);
  }
  return task.promise.finally(() => task.listeners.delete(onProgress));
}

export async function readPracticeBanks() {
  const entries = await Promise.all(PRACTICE_BANKS.map(async ({ section }) => [section, await getCached(section)]));
  return Object.fromEntries(entries.filter(([, cache]) => hasPracticeBank(cache)));
}

export async function refreshDownloadedPracticeContent() {
  const banks = await readPracticeBanks();
  return Promise.allSettled(Object.keys(banks).map((section) => syncPracticeContent(section)));
}

// No setup flag: readiness is based on the actual banks, including downloads
// previously made in Free Practice. Retry resumes with the missing banks only.
export async function ensureCoachQuestionBanks(onProgress) {
  const banks = await readPracticeBanks();
  const missing = PRACTICE_BANKS.filter(({ section }) => !banks[section]);
  let loaded = PRACTICE_BANKS.length - missing.length;
  const emit = (extra = {}) => onProgress?.({ loaded, total: PRACTICE_BANKS.length, ...extra });
  if (!missing.length) {
    emit({ ready: true });
    void refreshDownloadedPracticeContent();
    return;
  }
  emit();
  for (const bank of missing) {
    await syncPracticeContent(bank.section, (pages) => emit({ section: bank.label, pages: pages.loaded }));
    loaded++;
    emit();
  }
  emit({ ready: true });
  void refreshDownloadedPracticeContent();
}
