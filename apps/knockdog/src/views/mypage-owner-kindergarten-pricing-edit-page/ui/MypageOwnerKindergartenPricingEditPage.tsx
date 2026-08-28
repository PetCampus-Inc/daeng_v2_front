'use client';

import { useCallback } from 'react';
import {
  ActionButton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Icon,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { Header } from '@widgets/Header';

import { ownerMypageContent } from '@features/role-conversion';
import { PRODUCT_TYPE_MAP_LIST, type ProductType } from '@entities/pricing';
import { EXTERNAL_LINKS } from '@shared/constants';
import { useOpenExternalLink, useNativeBackHandler } from '@shared/lib/bridge';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { toast } from '@shared/ui/toast';
import { useKindergartenPricingEditForm } from '@views/mypage-owner-kindergarten-pricing-edit-page/model/useKindergartenPricingEditForm';

function selectionChipClassName(isSelected: boolean) {
  const toneClass = isSelected
    ? 'bg-fill-secondary-700 text-text-primary-inverse'
    : 'bg-fill-secondary-50 text-text-primary';

  return `radius-r2 body2-semibold h-12 shrink-0 whitespace-nowrap px-4 ${toneClass}`;
}

interface FieldLabelProps {
  label: string;
  required?: boolean;
}

function FieldLabel({ label, required = false }: FieldLabelProps) {
  return (
    <div className='body2-bold flex items-center gap-px'>
      <span className='text-text-primary'>{label}</span>
      {required ? <span className='text-text-accent'>*</span> : null}
    </div>
  );
}

interface ProductTypeChipGroupProps {
  selected: ProductType[];
  onToggle: (code: ProductType) => void;
}

function ProductTypeChipGroup({ selected, onToggle }: ProductTypeChipGroupProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      {PRODUCT_TYPE_MAP_LIST.map(({ code, name }) => {
        const isSelected = selected.includes(code);
        return (
          <button
            key={code}
            type='button'
            aria-pressed={isSelected}
            onClick={() => onToggle(code)}
            className={selectionChipClassName(isSelected)}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}

function MypageOwnerKindergartenPricingEditPage() {
  const formData = useKindergartenPricingEditForm();
  const openExternalLink = useOpenExternalLink();

  const handleBack = useCallback(() => {
    if (formData.leaveIfClean()) return;

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ownerMypageContent.unsavedExitModalTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {ownerMypageContent.unsavedExitModalDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ownerMypageContent.unsavedExitModalCancelLabel}</AlertDialogCancel>
            <AlertDialogAction onClick={formData.handleLeaveWithoutSaving}>
              {ownerMypageContent.unsavedExitModalConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  }, [formData]);

  useNativeBackHandler(handleBack);

  const handleSave = async () => {
    if (!(await formData.handleSave())) return;

    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: ownerMypageContent.kindergartenEditSaveSuccessToastFallback,
      titleParts: [
        { text: ownerMypageContent.kindergartenEditSaveSuccessToastPrefix, accent: true },
        { text: ownerMypageContent.kindergartenEditSaveSuccessToastSuffix },
      ],
      title: (
        <>
          <span className='body1-bold text-text-accent'>
            {ownerMypageContent.kindergartenEditSaveSuccessToastPrefix}
          </span>
          <span className='body1-medium text-text-primary-inverse'>
            {ownerMypageContent.kindergartenEditSaveSuccessToastSuffix}
          </span>
        </>
      ),
    });
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{ownerMypageContent.kindergartenPricingEditPageTitle}</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col'>
        <div className='flex-1 overflow-y-auto'>
          <div className='flex flex-col gap-2 px-4 py-4'>
            <FieldLabel
              label={ownerMypageContent.kindergartenPricingEditProductTypeLabel}
              required
            />
            <ProductTypeChipGroup
              selected={formData.productTypes}
              onToggle={formData.toggleProductType}
            />
          </div>

          <div className='flex flex-col gap-2 px-4 py-4'>
            <FieldLabel label={ownerMypageContent.kindergartenPricingEditPriceListLabel} required />
            <PhotoUploader
              key={
                formData.priceImages
                  .map((image) => image.key ?? image.uri)
                  .join('|') || 'price-images-empty'
              }
              maxCount={5}
              emptyVariant='tile'
              defaultValue={formData.priceImages}
              onChange={formData.handlePriceImagesChange}
            />
          </div>

          <div className='flex flex-col gap-1 px-4 py-4'>
            <div className='flex items-center justify-between gap-3'>
              <span className='body1-bold text-text-primary'>
                {ownerMypageContent.kindergartenPricingEditServiceNoticeTitle}
              </span>
              <button
                type='button'
                className='body2-semibold text-text-tertiary flex shrink-0 items-center gap-1 px-2 py-1'
                onClick={() => openExternalLink(EXTERNAL_LINKS.OWNER_CONTACT)}
              >
                {ownerMypageContent.kindergartenPricingEditCustomerCenterLabel}
                <Icon icon='ChevronRight' className='size-4' />
              </button>
            </div>
            <p className='body2-regular text-text-tertiary'>
              {ownerMypageContent.kindergartenPricingEditServiceNoticeDescription}
            </p>
          </div>
        </div>

        <div className='relative shrink-0 px-4 pt-5 pb-5'>
          <div className='pointer-events-none absolute inset-x-0 -top-28 h-28 bg-gradient-to-b from-transparent to-white' />
          <ActionButton
            type='button'
            size='large'
            variant='primaryFill'
            className='relative w-full'
            disabled={!formData.isSaveEnabled || formData.isSaving}
            onClick={handleSave}
          >
            {ownerMypageContent.profileSaveButtonLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export { MypageOwnerKindergartenPricingEditPage };
