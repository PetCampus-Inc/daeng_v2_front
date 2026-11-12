const DIARY_ONBOARDING_SEEN_KEY = 'diary-onboarding-seen';
const DIARY_ONBOARDING_OPEN_DELAY_MS = 400;

function hasSeenDiaryOnboarding() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(DIARY_ONBOARDING_SEEN_KEY) === 'seen';
}

function markDiaryOnboardingSeen() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DIARY_ONBOARDING_SEEN_KEY, 'seen');
}

export { DIARY_ONBOARDING_OPEN_DELAY_MS, DIARY_ONBOARDING_SEEN_KEY, hasSeenDiaryOnboarding, markDiaryOnboardingSeen };
