import type { FilterOption } from '@entities/kindergarten';
import type { WebImageAsset } from '@shared/lib/media';

const EDIT_FORM_DRAFT_KEY = 'owner_kindergarten_edit_form_draft';
const EDIT_FORM_DRAFT_UPDATED_EVENT = 'owner-kindergarten-edit:form-draft-updated';

interface EditableImageAsset {
  uri: string;
  preSignedUrl?: string;
  key?: string;
  width?: number;
  height?: number;
  type?: 'image';
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}

interface EditFormDraft {
  images: EditableImageAsset[];
  name: string;
  address: string;
  addressDetail: string;
  phone: string;
  weekdayStart: string | null;
  weekdayEnd: string | null;
  weekendStart: string | null;
  weekendEnd: string | null;
  closedDays: string[];
  homepage: string;
  instagram: string;
  youtube: string;
  breeds: FilterOption[];
  dogServices: FilterOption[];
  safetyFacilities: FilterOption[];
  amenities: FilterOption[];
  lastUpdatedDate: string | null;
  /** 저장 이후 false. 주소 이동·필드 변경 시 true */
  isDirty: boolean;
}

const emptyEditFormDraft: EditFormDraft = {
  images: [],
  name: '',
  address: '',
  addressDetail: '',
  phone: '',
  weekdayStart: null,
  weekdayEnd: null,
  weekendStart: null,
  weekendEnd: null,
  closedDays: [],
  homepage: '',
  instagram: '',
  youtube: '',
  breeds: [],
  dogServices: [],
  safetyFacilities: [],
  amenities: [],
  lastUpdatedDate: null,
  isDirty: false,
};

function notifyEditFormDraftUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EDIT_FORM_DRAFT_UPDATED_EVENT));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isEditableImage(value: unknown): value is EditableImageAsset {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.uri === 'string' && record.uri.length > 0;
}

function isEditFormDraft(value: unknown): value is EditFormDraft {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  return (
    Array.isArray(record.images) &&
    record.images.every(isEditableImage) &&
    typeof record.name === 'string' &&
    typeof record.address === 'string' &&
    typeof record.addressDetail === 'string' &&
    typeof record.phone === 'string' &&
    (record.weekdayStart === null || typeof record.weekdayStart === 'string') &&
    (record.weekdayEnd === null || typeof record.weekdayEnd === 'string') &&
    (record.weekendStart === null || typeof record.weekendStart === 'string') &&
    (record.weekendEnd === null || typeof record.weekendEnd === 'string') &&
    isStringArray(record.closedDays) &&
    typeof record.homepage === 'string' &&
    typeof record.instagram === 'string' &&
    typeof record.youtube === 'string' &&
    isStringArray(record.breeds) &&
    isStringArray(record.dogServices) &&
    isStringArray(record.safetyFacilities) &&
    isStringArray(record.amenities) &&
    (record.lastUpdatedDate === null || typeof record.lastUpdatedDate === 'string') &&
    typeof record.isDirty === 'boolean'
  );
}

function serializeImages(images: WebImageAsset[]): EditableImageAsset[] {
  return images.map(({ uri, preSignedUrl, key, width, height, type, fileName, mimeType, fileSize }) => ({
    uri,
    preSignedUrl,
    key,
    width,
    height,
    type,
    fileName,
    mimeType,
    fileSize,
  }));
}

function toWebImageAssets(images: EditableImageAsset[]): WebImageAsset[] {
  return images.map((image) => ({
    uri: image.uri,
    preSignedUrl: image.preSignedUrl ?? image.uri,
    key: image.key ?? image.uri,
    width: image.width,
    height: image.height,
    type: image.type,
    fileName: image.fileName,
    mimeType: image.mimeType,
    fileSize: image.fileSize,
  }));
}

function saveEditFormDraft(draft: EditFormDraft, options?: { notify?: boolean }) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(
    EDIT_FORM_DRAFT_KEY,
    JSON.stringify({
      ...draft,
      images: serializeImages(draft.images as WebImageAsset[]),
    })
  );

  if (options?.notify) {
    notifyEditFormDraftUpdated();
  }
}

function loadEditFormDraft(): EditFormDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(EDIT_FORM_DRAFT_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isEditFormDraft(parsed)) return null;

    return {
      ...parsed,
      images: toWebImageAssets(parsed.images),
    };
  } catch {
    return null;
  }
}

function updateEditFormDraftAddress(address: string) {
  const draft = loadEditFormDraft() ?? emptyEditFormDraft;

  saveEditFormDraft(
    {
      ...draft,
      address,
      isDirty: true,
    },
    { notify: true }
  );
}

function clearEditFormDraft() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(EDIT_FORM_DRAFT_KEY);
}

export {
  clearEditFormDraft,
  emptyEditFormDraft,
  EDIT_FORM_DRAFT_UPDATED_EVENT,
  loadEditFormDraft,
  saveEditFormDraft,
  updateEditFormDraftAddress,
  type EditFormDraft,
};
