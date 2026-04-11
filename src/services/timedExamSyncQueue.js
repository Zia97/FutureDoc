import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../lib/dbQueries';

// ============================================================
// Offline write queue for timed exam submissions and deletions.
//
// When the cloud write in a useTimed*ExamProgress hook fails
// (no network, server hiccup, etc.), the operation is enqueued
// here. The queue is flushed on:
//   • hook mount / user change (loadAttempts)
//   • app return to foreground (useTimedExamSyncOnForeground)
//   • test list focus (via reload → loadAttempts)
//
// Entries are tagged with the userId that created them so we
// never accidentally push one user's queued writes under another
// user's session if they sign out and a different user signs in.
// ============================================================

const QUEUE_KEY = 'timed_exam_sync_queue';

// Maps section code → method name on the dbQueries singleton.
const SUBMIT_FN = {
  vr: 'submitTimedVRExam',
  dm: 'submitTimedDMExam',
  qr: 'submitTimedQRExam',
  sj: 'submitTimedSJExam',
};

const DELETE_FN = {
  vr: 'deleteTimedVRAttempt',
  dm: 'deleteTimedDMAttempt',
  qr: 'deleteTimedQRAttempt',
  sj: 'deleteTimedSJAttempt',
};

// Module-level guard so concurrent flush() calls (e.g. mount +
// foreground listener firing simultaneously) don't double-push.
let isFlushing = false;

// Loose UUID v4-ish check — anything containing dashes in the right
// places is treated as a valid Postgres UUID. We use this to detect
// queue entries created before the QR setId fix (legacy entries used
// human-readable refs like "qr1-set-01" which Postgres rejects as
// `22P02 invalid input syntax for type uuid`).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidQrSubmitPayload(payload) {
  if (!payload || !Array.isArray(payload.answers)) return true;
  for (const a of payload.answers) {
    if (a.set_id != null && !UUID_RE.test(String(a.set_id))) return false;
    if (a.question_id != null && !UUID_RE.test(String(a.question_id))) return false;
  }
  return true;
}

async function readQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeQueue(entries) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(entries));
  } catch (err) {
    if (__DEV__) console.error('[timedExamSyncQueue] writeQueue failed:', err);
  }
}

// Dedup key — only one pending op per (user, section, testKey).
// A new entry replaces any older one so the queue always reflects
// the user's most recent intent (latest submit, or latest delete).
function dedupKey(entry) {
  return `${entry.userId}|${entry.section}|${entry.testKey}`;
}

// ── Public API ──────────────────────────────────────────────

/**
 * Adds (or replaces) a pending operation in the queue.
 *
 * @param {object} entry
 * @param {string} entry.userId   - Owner of this entry
 * @param {'vr'|'dm'|'qr'|'sj'} entry.section
 * @param {'submit'|'delete'} entry.op
 * @param {string|number} entry.testKey - Local cache key (for dedup)
 * @param {number} entry.testId   - Numeric DB test_id (for delete ops)
 * @param {object} [entry.payload] - Args to submitTimedXExam (submit ops only)
 */
export async function enqueue(entry) {
  const queue = await readQueue();
  const key = dedupKey(entry);
  const filtered = queue.filter((e) => dedupKey(e) !== key);
  filtered.push({ ...entry, createdAt: new Date().toISOString() });
  await writeQueue(filtered);
}

/**
 * Removes any pending entry matching (user, section, testKey).
 * Called after a direct cloud write succeeds, to drop the now-stale
 * queued copy of the same operation.
 */
export async function removePending({ userId, section, testKey }) {
  const queue = await readQueue();
  const key = `${userId}|${section}|${testKey}`;
  const filtered = queue.filter((e) => dedupKey(e) !== key);
  if (filtered.length !== queue.length) {
    await writeQueue(filtered);
  }
}

/**
 * Pushes all pending entries for the given user to Supabase.
 * Stops on first failure (assumes still offline) and leaves the
 * remainder in the queue for the next flush.
 *
 * Other users' entries are left untouched.
 *
 * @param {object} user - The current auth user (from useAuth)
 * @returns {Promise<{flushed: number, remaining: number}>}
 */
export async function flush(user) {
  if (!user || isFlushing) return { flushed: 0, remaining: 0 };
  isFlushing = true;
  try {
    const queue = await readQueue();
    const mine   = queue.filter((e) => e.userId === user.id);
    const others = queue.filter((e) => e.userId !== user.id);
    if (mine.length === 0) return { flushed: 0, remaining: 0 };

    let flushed = 0;
    const dropped = []; // indices we permanently discarded (will not be retried)

    for (let i = 0; i < mine.length; i++) {
      const entry = mine[i];

      // Pre-flight: drop entries we know will never succeed so they don't
      // block the queue forever. Today the only case is QR submit payloads
      // created before the setId-UUID fix (see useTimedQRTests.js comment).
      if (
        entry.op === 'submit' &&
        entry.section === 'qr' &&
        !isValidQrSubmitPayload(entry.payload)
      ) {
        if (__DEV__) {
          console.warn(
            '[timedExamSyncQueue] dropping legacy QR submit with non-UUID set_id (test',
            entry.testId,
            ') — user will need to retake this test',
          );
        }
        dropped.push(i);
        flushed++;
        continue;
      }

      try {
        if (entry.op === 'submit') {
          const fn = SUBMIT_FN[entry.section];
          if (!fn) throw new Error(`Unknown section: ${entry.section}`);
          await db[fn](entry.payload);
        } else if (entry.op === 'delete') {
          const fn = DELETE_FN[entry.section];
          if (!fn) throw new Error(`Unknown section: ${entry.section}`);
          await db[fn](entry.testId);
        } else {
          // Unknown op — drop it rather than block the queue forever.
          if (__DEV__) console.warn('[timedExamSyncQueue] dropping unknown op:', entry.op);
        }
        flushed++;
      } catch (err) {
        if (__DEV__) console.error('[timedExamSyncQueue] flush failed at index', i, err);
        break;
      }
    }

    // Keep any entries we didn't get through (preserves order).
    const remainder = mine.slice(flushed);
    await writeQueue([...others, ...remainder]);
    return { flushed, remaining: remainder.length, dropped: dropped.length };
  } finally {
    isFlushing = false;
  }
}
