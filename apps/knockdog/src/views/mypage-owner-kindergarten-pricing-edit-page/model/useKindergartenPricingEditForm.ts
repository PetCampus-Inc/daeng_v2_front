'use client';

import { useEffect, useRef, useState } from 'react';

import { usePricingQuery } from '@features/pricing';
import { useOwnerKindergarten } from '@features/role-conversion';
import type { ProductType } from '@entities/pricing';
import { useStackNavigation } from '@shared/lib/bridge';
import type { WebImageAsset } from '@shared/lib/media';
import { mapPricingToEditDraft } from '@views/mypage-owner-kindergarten-pricing-edit-page/lib/mapPricingToEditDraft';
import {
  clearPricingEditFormDraft,
  loadPricingEditFormDraft,
  PRICING_EDIT_FORM_DRAFT_UPDATED_EVENT,
  savePricingEditFormDraft,
  type PricingEditFormDraft,
} from '@views/mypage-owner-kindergarten-pricing-edit-page/lib/pricingEditFormDraft';

function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function applyDraftToState(
  draft: PricingEditFormDraft,
  setters: {
    setProductTypes: (value: ProductType[]) => void;
    setPriceImages: (value: WebImageAsset[]) => void;
    setLastUpdatedDate: (value: string | null) => void;
    setIsDirty: (value: boolean) => void;
  }
) {
  setters.setProductTypes(draft.productTypes);
  setters.setPriceImages(draft.priceImages as WebImageAsset[]);
  setters.setLastUpdatedDate(draft.lastUpdatedDate);
  setters.setIsDirty(draft.isDirty);
}

function useKindergartenPricingEditForm() {
  const { back } = useStackNavigation();
  const { source, kindergartenId, pricing: profilePricing, isProfileLoading } =
    useOwnerKindergarten();
  const isSelected = source === 'search';

  const placePricingQuery = usePricingQuery(kindergartenId ?? '', {
    enabled: isSelected && Boolean(kindergartenId),
  });

  const placePricing = placePricingQuery.data;
  const isPricingDataReady = isSelected
    ? !kindergartenId || placePricingQuery.isFetched
    : !isProfileLoading;

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [priceImages, setPriceImages] = useState<WebImageAsset[]>([]);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const skipNextPersistRef = useRef(false);
  const hasHydratedDraftRef = useRef(false);
  const hasHydratedFromSourceRef = useRef(false);

  const draftSetters = {
    setProductTypes,
    setPriceImages,
    setLastUpdatedDate,
    setIsDirty,
  };

  const buildDraft = (
    nextIsDirty: boolean,
    overrides: Partial<PricingEditFormDraft> = {}
  ): PricingEditFormDraft => ({
    productTypes,
    priceImages: priceImages as PricingEditFormDraft['priceImages'],
    lastUpdatedDate,
    isDirty: nextIsDirty,
    ...overrides,
  });

  const persistDraft = (nextIsDirty: boolean, overrides: Partial<PricingEditFormDraft> = {}) => {
    savePricingEditFormDraft(buildDraft(nextIsDirty, overrides));
  };

  useEffect(() => {
    function syncDraftFromStorage() {
      if (document.visibilityState === 'hidden') return;

      const draft = loadPricingEditFormDraft();
      if (draft?.isDirty) {
        skipNextPersistRef.current = true;
        applyDraftToState(draft, draftSetters);
      }

      hasHydratedDraftRef.current = true;
    }

    syncDraftFromStorage();

    window.addEventListener('pageshow', syncDraftFromStorage);
    window.addEventListener(PRICING_EDIT_FORM_DRAFT_UPDATED_EVENT, syncDraftFromStorage);
    document.addEventListener('visibilitychange', syncDraftFromStorage);

    return () => {
      window.removeEventListener('pageshow', syncDraftFromStorage);
      window.removeEventListener(PRICING_EDIT_FORM_DRAFT_UPDATED_EVENT, syncDraftFromStorage);
      document.removeEventListener('visibilitychange', syncDraftFromStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount 시 draft 동기화만
  }, []);

  useEffect(() => {
    if (!hasHydratedDraftRef.current) return;
    if (hasHydratedFromSourceRef.current) return;
    if (isDirty) {
      hasHydratedFromSourceRef.current = true;
      return;
    }
    if (!isPricingDataReady) return;

    const sourcePricing = isSelected
      ? {
          productType: placePricing?.productType ?? [],
          priceImages: placePricing?.priceImages ?? [],
          lastUpdatedDate: placePricing?.lastUpdatedAt ?? null,
        }
      : {
          productType: profilePricing?.productType ?? [],
          priceImages: profilePricing?.priceImages ?? [],
          lastUpdatedDate: profilePricing?.lastUpdatedAt ?? null,
        };

    skipNextPersistRef.current = true;
    applyDraftToState(mapPricingToEditDraft(sourcePricing), draftSetters);
    hasHydratedFromSourceRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 소스 데이터 1회 하이드레이션
  }, [isDirty, isPricingDataReady, isSelected, placePricing, profilePricing]);

  useEffect(() => {
    if (!hasHydratedDraftRef.current) return;
    if (!hasHydratedFromSourceRef.current) return;

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    persistDraft(isDirty);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 폼 필드 변경 시에만 draft 저장
  }, [productTypes, priceImages, lastUpdatedDate, isDirty]);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const handleProductTypesChange = (next: ProductType[]) => {
    markDirty();
    setProductTypes(next);
  };

  const handlePriceImagesChange = (next: WebImageAsset[]) => {
    markDirty();
    setPriceImages(next);
  };

  const toggleProductType = (code: ProductType) => {
    const next = productTypes.includes(code)
      ? productTypes.filter((item) => item !== code)
      : [...productTypes, code];
    handleProductTypesChange(next);
  };

  const isSaveEnabled = productTypes.length > 0 && priceImages.length > 0;

  const handleLeaveWithoutSaving = () => {
    clearPricingEditFormDraft();
    back?.();
  };

  const leaveIfClean = () => {
    if (isDirty) return false;
    back?.();
    return true;
  };

  const handleSave = () => {
    if (!isSaveEnabled) return false;

    // TODO: 유치원 요금 정보 저장 API 연동
    const nextLastUpdatedDate = formatDate();
    skipNextPersistRef.current = true;
    setLastUpdatedDate(nextLastUpdatedDate);
    setIsDirty(false);
    persistDraft(false, { lastUpdatedDate: nextLastUpdatedDate });
    return true;
  };

  return {
    productTypes,
    priceImages,
    lastUpdatedDate,
    isDirty,
    isSaveEnabled,
    toggleProductType,
    handlePriceImagesChange,
    handleLeaveWithoutSaving,
    leaveIfClean,
    handleSave,
  };
}

export { useKindergartenPricingEditForm };
