const DIARY_ONBOARDING_SEEN_KEY = 'diary-onboarding-seen';
const DIARY_ONBOARDING_OPEN_DELAY_MS = 400;
let hasMemorySeen = false;

function hasSeenDiaryOnboarding() {
  if (hasMemorySeen) return true;
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(DIARY_ONBOARDING_SEEN_KEY) === 'seen';
  } catch {
    return false;
  }
}

function markDiaryOnboardingSeen() {
  if (typeof window === 'undefined') {
    hasMemorySeen = true;
    return;
  }
  try {
    window.localStorage.setItem(DIARY_ONBOARDING_SEEN_KEY, 'seen');
  } catch {
    hasMemorySeen = true;
  }
}

export { DIARY_ONBOARDING_OPEN_DELAY_MS, DIARY_ONBOARDING_SEEN_KEY, hasSeenDiaryOnboarding, markDiaryOnboardingSeen };
