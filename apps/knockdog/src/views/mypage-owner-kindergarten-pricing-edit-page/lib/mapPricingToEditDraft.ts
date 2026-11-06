import type { ProductType } from '@entities/pricing';
import type { WebImageAsset } from '@shared/lib/media';

import {
  emptyPricingEditFormDraft,
  type PricingEditFormDraft,
} from '@views/mypage-owner-kindergarten-pricing-edit-page/lib/pricingEditFormDraft';

function toImageAssets(imageKeys: string[]): WebImageAsset[] {
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? '';

  return imageKeys
    .filter((key) => Boolean(key?.trim()))
    .slice(0, 5)
    .map((key) => {
      const uri = `${imageBaseUrl}${encodeURI(key)}`;
      return {
        key,
        uri,
        preSignedUrl: uri,
        type: 'image' as const,
      };
    });
}

interface MapPricingToEditDraftParams {
  productType?: ProductType[];
  priceImages?: string[];
  lastUpdatedDate?: string | null;
}

function mapPricingToEditDraft({
  productType = [],
  priceImages = [],
  lastUpdatedDate = null,
}: MapPricingToEditDraftParams): PricingEditFormDraft {
  return {
    ...emptyPricingEditFormDraft,
    productTypes: productType,
    priceImages: toImageAssets(priceImages),
    lastUpdatedDate: lastUpdatedDate?.trim() || null,
    isDirty: false,
  };
}

export { mapPricingToEditDraft };
