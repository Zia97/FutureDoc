import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { reportError } from '../lib/reportError';

// Smartly asks the user for a store rating after a positive, high-engagement
// moment. The OS (App Store / Play Store) throttles the native prompt heavily,
// so we only spend our one request on a user who has clearly enjoyed the app.

const STATE_KEY = 'review_prompt_v1';

const DEFAULT_STATE = {
  launchCount: 0,
  answeredCount: 0,
  hasRequested: false,
};

// Gates — all must be satisfied before we ask.
const MIN_LAUNCHES = 3;
const MIN_ANSWERS = 10;

async function getState() {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch (err) {
    reportError('reviewPromptService', err, { level: 'warning', extra: { note: 'getState failed' } });
    return { ...DEFAULT_STATE };
  }
}

async function setState(next) {
  try {
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify(next));
  } catch (err) {
    reportError('reviewPromptService', err, { level: 'warning', extra: { note: 'setState failed' } });
  }
}

/** Call once on app launch. */
export async function recordAppLaunch() {
  const state = await getState();
  await setState({ ...state, launchCount: state.launchCount + 1 });
}

/**
 * Call on every committed practice/test answer. Returns true if the native
 * prompt was fired.
 */
export async function maybeRequestReview() {
  try {
    const state = await getState();

    // Always keep the answer tally moving, even when we don't ask.
    const answeredCount = state.answeredCount + 1;

    const eligible =
      !state.hasRequested &&
      state.launchCount >= MIN_LAUNCHES &&
      answeredCount >= MIN_ANSWERS &&
      (await StoreReview.hasAction());

    if (!eligible) {
      await setState({ ...state, answeredCount });
      return false;
    }

    await StoreReview.requestReview();
    await setState({ ...state, answeredCount, hasRequested: true });
    return true;
  } catch (err) {
    reportError('reviewPromptService', err, { level: 'warning', extra: { note: 'maybeRequestReview failed' } });
    return false;
  }
}
