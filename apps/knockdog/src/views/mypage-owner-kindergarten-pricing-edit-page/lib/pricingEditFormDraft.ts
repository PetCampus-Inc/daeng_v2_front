import type { ProductType } from '@entities/pricing';
import type { WebImageAsset } from '@shared/lib/media';

const PRICING_EDIT_FORM_DRAFT_KEY = 'owner_kindergarten_pricing_edit_form_draft';
const PRICING_EDIT_FORM_DRAFT_UPDATED_EVENT = 'owner-kindergarten-pricing-edit:form-draft-updated';

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

interface PricingEditFormDraft {
  productTypes: ProductType[];
  priceImages: EditableImageAsset[];
  lastUpdatedDate: string | null;
  isDirty: boolean;
}

const emptyPricingEditFormDraft: PricingEditFormDraft = {
  productTypes: [],
  priceImages: [],
  lastUpdatedDate: null,
  isDirty: false,
};

function notifyPricingEditFormDraftUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PRICING_EDIT_FORM_DRAFT_UPDATED_EVENT));
}

function isProductType(value: unknown): value is ProductType {
  return value === 'COUNT_TICKET' || value === 'MONTHLY_TICKET' || value === 'MEMBERSHIP';
}

function isEditableImage(value: unknown): value is EditableImageAsset {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return typeof record.uri === 'string' && record.uri.length > 0;
}

function isPricingEditFormDraft(value: unknown): value is PricingEditFormDraft {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  return (
    Array.isArray(record.productTypes) &&
    record.productTypes.every(isProductType) &&
    Array.isArray(record.priceImages) &&
    record.priceImages.every(isEditableImage) &&
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

function savePricingEditFormDraft(draft: PricingEditFormDraft) {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem(
    PRICING_EDIT_FORM_DRAFT_KEY,
    JSON.stringify({
      ...draft,
      priceImages: serializeImages(draft.priceImages as WebImageAsset[]),
    })
  );
}

function loadPricingEditFormDraft(): PricingEditFormDraft | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(PRICING_EDIT_FORM_DRAFT_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isPricingEditFormDraft(parsed)) return null;

    return {
      ...parsed,
      priceImages: toWebImageAssets(parsed.priceImages),
    };
  } catch {
    return null;
  }
}

function clearPricingEditFormDraft() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PRICING_EDIT_FORM_DRAFT_KEY);
}

export {
  clearPricingEditFormDraft,
  emptyPricingEditFormDraft,
  loadPricingEditFormDraft,
  PRICING_EDIT_FORM_DRAFT_UPDATED_EVENT,
  savePricingEditFormDraft,
  type PricingEditFormDraft,
};
