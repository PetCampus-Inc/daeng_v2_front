'use client';

import { ActionButton, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useOpenExternalLink } from '@shared/lib/bridge';

import { requiredTermsConsentContent } from '../config/requiredTermsConsentContent';
import { useSyncRequiredTermsOverlay } from '../lib/useSyncRequiredTermsOverlay';
import { useRequiredTermsConsentSheet } from '../model/useRequiredTermsConsentSheet';
import { TermsItemCheckControl, TermsMasterCheckControl } from './TermsCheckControl';

function RequiredTermsConsentSheetHost() {
  const openExternalLink = useOpenExternalLink();
  const {
    isOpen,
    checkedTerms,
    isAllChecked,
    isSubmitting,
    handleMasterCheckedChange,
    handleItemCheckedChange,
    handleOpenChange,
    handleSubmit,
  } = useRequiredTermsConsentSheet();

  useSyncRequiredTermsOverlay(isOpen);

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange} dismissible={false} modal>
      <BottomSheet.Overlay className='z-modal bg-[rgba(15,20,26,0.7)]' />
      <BottomSheet.Body className='z-modal max-h-none rounded-t-[28px] bg-bg-0 pt-5 shadow-[0px_-16px_20px_rgba(0,0,0,0.05)]'>
        <div className='flex flex-col gap-2 p-4'>
          <button
            type='button'
            className='border-line-200 radius-r2 flex w-full items-center gap-2 border bg-bg-0 p-4 text-left'
            onClick={() => handleMasterCheckedChange(!isAllChecked)}
          >
            <TermsMasterCheckControl checked={isAllChecked} />
            <span className='body1-bold text-text-secondary min-w-0 flex-1'>{requiredTermsConsentContent.masterLabel}</span>
          </button>

          <div className='flex w-full flex-col'>
            {requiredTermsConsentContent.items.map((item) => {
              const isChecked = checkedTerms[item.id];
              const hasDetailUrl = 'detailUrl' in item && Boolean(item.detailUrl);

              return (
                <div key={item.id} className='flex items-center gap-2 px-4 py-3'>
                  <button
                    type='button'
                    className='flex min-w-0 flex-1 items-center gap-2 text-left'
                    aria-checked={isChecked}
                    onClick={() => handleItemCheckedChange(item.id, !isChecked)}
                  >
                    <TermsItemCheckControl checked={isChecked} />
                    <span className={cn('body2-semibold min-w-0 flex-1', 'text-text-secondary')}>{item.label}</span>
                  </button>
                  {hasDetailUrl ? (
                    <button
                      type='button'
                      className='text-text-secondary flex size-6 shrink-0 items-center justify-center'
                      aria-label={`${item.label} 상세 보기`}
                      onClick={() => openExternalLink(item.detailUrl!)}
                    >
                      <Icon icon='ChevronRight' className='size-6' />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className='px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]'>
          <ActionButton
            type='button'
            variant='primaryFill'
            size='large'
            className='w-full'
            disabled={!isAllChecked || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {requiredTermsConsentContent.submitLabel}
          </ActionButton>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { RequiredTermsConsentSheetHost };
