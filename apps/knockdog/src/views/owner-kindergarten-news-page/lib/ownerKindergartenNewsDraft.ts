import { STORAGE_KEYS } from '@shared/constants/storage';
import { safeLocalStorage } from '@shared/lib/storage';

interface OwnerKindergartenNewsDraft {
  title: string;
  body: string;
  imageUrls: string[];
  isAnnouncement: boolean;
  notifyGuardiansOnUpload: boolean;
  /** 수정 화면 드래프트일 때 대상 소식 id */
  newsId?: string;
  updatedAt: string;
}

function getDraftStorageKey(kindergartenKey: string, newsId?: string) {
  const base = `${STORAGE_KEYS.OWNER_KINDERGARTEN_NEWS_DRAFT}:${kindergartenKey}`;
  return newsId ? `${base}:edit:${newsId}` : `${base}:write`;
}

function saveOwnerKindergartenNewsDraft(
  kindergartenKey: string,
  draft: Omit<OwnerKindergartenNewsDraft, 'updatedAt'>
) {
  const payload: OwnerKindergartenNewsDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  safeLocalStorage.set(getDraftStorageKey(kindergartenKey, draft.newsId), JSON.stringify(payload));
}

function clearOwnerKindergartenNewsDraft(kindergartenKey: string, newsId?: string) {
  safeLocalStorage.remove(getDraftStorageKey(kindergartenKey, newsId));
}

export type { OwnerKindergartenNewsDraft };
export { saveOwnerKindergartenNewsDraft, clearOwnerKindergartenNewsDraft };
