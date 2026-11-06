import { STORAGE_KEYS } from '@shared/constants/storage';
import { safeLocalStorage } from '@shared/lib/storage';

function getBannerDismissedKey(kindergartenKey: string) {
  return `${STORAGE_KEYS.OWNER_KINDERGARTEN_NEWS_SETTINGS_BANNER_DISMISSED}:${kindergartenKey}`;
}

function isOwnerKindergartenNewsSettingsBannerDismissed(kindergartenKey: string) {
  return safeLocalStorage.get(getBannerDismissedKey(kindergartenKey)) === '1';
}

function dismissOwnerKindergartenNewsSettingsBanner(kindergartenKey: string) {
  safeLocalStorage.set(getBannerDismissedKey(kindergartenKey), '1');
}

export {
  isOwnerKindergartenNewsSettingsBannerDismissed,
  dismissOwnerKindergartenNewsSettingsBanner,
};
