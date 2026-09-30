import { STORAGE_KEYS } from '@shared/constants/storage';
import { safeLocalStorage } from '@shared/lib/storage';

interface OwnerKindergartenNewsDraftImage {
  previewUrl: string;
  imageId?: number;
  tempKey?: string;
  fileName?: string;
}

interface OwnerKindergartenNewsDraft {
  title: string;
  body: string;
  imageUrls: string[];
  /** 기존 사진 imageId·tempKey. 없으면 imageUrls만 복원 */
  images?: OwnerKindergartenNewsDraftImage[];
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

  localStorage.setItem(getDraftStorageKey(kindergartenKey, draft.newsId), JSON.stringify(payload));
}

function clearOwnerKindergartenNewsDraft(kindergartenKey: string, newsId?: string) {
  safeLocalStorage.remove(getDraftStorageKey(kindergartenKey, newsId));
}

function isDraftImage(value: unknown): value is OwnerKindergartenNewsDraftImage {
  if (!value || typeof value !== 'object') return false;
  const image = value as Partial<OwnerKindergartenNewsDraftImage>;
  return (
    typeof image.previewUrl === 'string' &&
    (image.imageId === undefined || typeof image.imageId === 'number') &&
    (image.tempKey === undefined || typeof image.tempKey === 'string') &&
    (image.fileName === undefined || typeof image.fileName === 'string')
  );
}

function isValidDraft(value: unknown): value is OwnerKindergartenNewsDraft {
  if (!value || typeof value !== 'object') return false;

  const draft = value as Partial<OwnerKindergartenNewsDraft>;
  return (
    typeof draft.title === 'string' &&
    typeof draft.body === 'string' &&
    Array.isArray(draft.imageUrls) &&
    draft.imageUrls.every((url) => typeof url === 'string') &&
    typeof draft.isAnnouncement === 'boolean' &&
    typeof draft.notifyGuardiansOnUpload === 'boolean' &&
    typeof draft.updatedAt === 'string' &&
    (draft.newsId === undefined || typeof draft.newsId === 'string') &&
    (draft.images === undefined || (Array.isArray(draft.images) && draft.images.every(isDraftImage)))
  );
}

function loadOwnerKindergartenNewsDraft(
  kindergartenKey: string,
  newsId?: string
): OwnerKindergartenNewsDraft | null {
  const raw = safeLocalStorage.get(getDraftStorageKey(kindergartenKey, newsId));
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isValidDraft(parsed)) return null;
    if (newsId && parsed.newsId !== newsId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export type { OwnerKindergartenNewsDraft, OwnerKindergartenNewsDraftImage };
export {
  saveOwnerKindergartenNewsDraft,
  clearOwnerKindergartenNewsDraft,
  loadOwnerKindergartenNewsDraft,
};
