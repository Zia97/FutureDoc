import AsyncStorage from '@react-native-async-storage/async-storage';

// Gate flags for the post-ToS onboarding flow. Each gate is local-only and
// device-scoped — anonymous and real users alike persist the same flags so
// that signing up after "Skip for now" doesn't replay the gates.
export const AUTH_CHOICE_KEY = 'auth_choice_made_v1';
export const EXAM_DATE_KEY = 'exam_date_v1';
export const WELCOME_SEEN_KEY = 'welcome_seen_v1';

// Sentinel stored in EXAM_DATE_KEY when the user picked "Not booked yet".
// Lets us distinguish "hasn't gone through the gate" (null) from "went
// through it and chose to skip" (NOT_BOOKED).
export const NOT_BOOKED = 'NOT_BOOKED';

export const setAuthChoiceMade = () => AsyncStorage.setItem(AUTH_CHOICE_KEY, 'true');
export const setWelcomeSeen = () => AsyncStorage.setItem(WELCOME_SEEN_KEY, 'true');

export const setExamDate = (isoDateOrNotBooked) =>
  AsyncStorage.setItem(EXAM_DATE_KEY, isoDateOrNotBooked);

// Returns null if never set, NOT_BOOKED if user opted out, or an ISO date
// (YYYY-MM-DD) string the caller can parse with new Date(...).
export const getExamDate = async () => {
  try {
    return await AsyncStorage.getItem(EXAM_DATE_KEY);
  } catch {
    return null;
  }
};
