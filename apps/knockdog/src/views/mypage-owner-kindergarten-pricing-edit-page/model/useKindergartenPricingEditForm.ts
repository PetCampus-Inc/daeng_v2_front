'use client';

import { useEffect, useRef, useState } from 'react';

import { usePricingQuery } from '@features/pricing';
import { useOwnerKindergarten } from '@features/role-conversion';
import {
  usePutOwnerSchoolPriceMutation,
  type OwnerSchoolPricingType,
} from '@entities/owner-school';
import type { ProductType } from '@entities/pricing';
import { useStackNavigation } from '@shared/lib/bridge';
import { useMoveImageMutation, type WebImageAsset } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';
import { buildOwnerSchoolPriceImages } from '@views/mypage-owner-kindergarten-pricing-edit-page/lib/buildOwnerSchoolPriceImages';
import { mapPricingToEditDraft } from '@views/mypage-owner-kindergarten-pricing-edit-page/lib/mapPricingToEditDraft';
import {
  clearPricingEditFormDraft,
  loadPricingEditFormDraft,
  PRICING_EDIT_FORM_DRAFT_UPDATED_EVENT,
  savePricingEditFormDraft,
  type PricingEditFormDraft,
} from '@views/mypage-owner-kindergarten-pricing-edit-page/lib/pricingEditFormDraft';

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

  /** SELECTED면 place pricing 항상 조회 — profile 비었을 때 폴백용 */
  const placePricingQuery = usePricingQuery(kindergartenId ?? '', {
    enabled: isSelected && Boolean(kindergartenId),
  });
  const { mutateAsync: moveImageAsync } = useMoveImageMutation();
  const { mutateAsync: putPriceAsync, isPending: isSaving } = usePutOwnerSchoolPriceMutation({
    kindergartenId: isSelected ? kindergartenId : undefined,
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
  /** dirty draft를 setState보다 먼저 잠궈 source hydration 덮어쓰기 방지 */
  const hasRestoredDirtyDraftRef = useRef(false);

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
        hasRestoredDirtyDraftRef.current = true;
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

    if (hasRestoredDirtyDraftRef.current) {
      hasHydratedFromSourceRef.current = true;
      return;
    }

    if (isDirty) {
      hasHydratedFromSourceRef.current = true;
      return;
    }
    if (!isPricingDataReady) return;

    const profileProductTypes = profilePricing?.productType ?? [];
    const profilePriceImages = profilePricing?.priceImages ?? [];
    const placeProductTypes = placePricing?.productType ?? [];
    const placePriceImages = placePricing?.priceImages ?? [];

    /** profile 상품유형/가격표 비면 place 폴백 */
    const sourcePricing = isSelected
      ? {
          productType:
            profileProductTypes.length > 0 ? profileProductTypes : placeProductTypes,
          priceImages: profilePriceImages.length > 0 ? profilePriceImages : placePriceImages,
          lastUpdatedDate:
            profilePricing?.lastUpdatedAt ?? placePricing?.lastUpdatedAt ?? null,
        }
      : {
          productType: profileProductTypes,
          priceImages: profilePriceImages,
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

  const handleSave = async () => {
    if (!isSaveEnabled || isSaving) return false;

    try {
      const nextAssets = [...priceImages];
      const nextPriceImages: { s3Key: string; displayOrder: number }[] = [];

      for (let index = 0; index < nextAssets.length; index += 1) {
        const asset = nextAssets[index];
        if (!asset) continue;

        const moved = await buildOwnerSchoolPriceImages({
          assets: [asset],
          moveImage: moveImageAsync,
        });
        const payload = moved[0];
        if (!payload?.s3Key) {
          throw new Error('가격표 이미지 이동에 실패했어요');
        }

        nextPriceImages.push({ s3Key: payload.s3Key, displayOrder: index });
        nextAssets[index] = {
          ...asset,
          key: payload.s3Key,
        } as WebImageAsset;

        // PUT 전/부분 실패 후에도 이동된 영구 키 재사용
        skipNextPersistRef.current = true;
        setPriceImages([...nextAssets]);
        savePricingEditFormDraft(
          buildDraft(true, {
            priceImages: nextAssets as PricingEditFormDraft['priceImages'],
          })
        );
      }

      await putPriceAsync({
        pricingTypes: productTypes as OwnerSchoolPricingType[],
        priceImages: nextPriceImages,
      });

      skipNextPersistRef.current = true;
      clearPricingEditFormDraft();
      setIsDirty(false);
      back?.();
      return true;
    } catch (error) {
      console.error('[pricing edit save]', error);
      toast({
        type: 'default',
        shape: 'rounded',
        position: 'bottom',
        title: '요금 정보 저장에 실패했어요',
        description: error instanceof Error ? error.message : undefined,
      });
      return false;
    }
  };

  return {
    productTypes,
    priceImages,
    lastUpdatedDate,
    isDirty,
    isSaveEnabled,
    isSaving,
    toggleProductType,
    handlePriceImagesChange,
    handleLeaveWithoutSaving,
    leaveIfClean,
    handleSave,
  };
}

export { useKindergartenPricingEditForm };
