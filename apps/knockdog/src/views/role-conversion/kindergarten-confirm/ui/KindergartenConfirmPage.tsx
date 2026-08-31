'use client';

import { useCallback } from 'react';
import { ActionButton, ProgressBar } from '@knockdog/ui';

import { Header } from '@widgets/Header';

import { roleConversionProgress } from '@views/role-conversion/config/roleConversionProgress';
import { KindergartenInfoSummary } from '@views/role-conversion/ui/KindergartenInfoSummary';

import { kindergartenConfirmContent } from '@views/role-conversion/kindergarten-confirm/config/kindergartenConfirmContent';
import { useKindergartenConfirmPage } from '@views/role-conversion/kindergarten-confirm/model/useKindergartenConfirmPage';
import { ActionLoadingOverlay, DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { useNativeBackHandler, useStackNavigation } from '@shared/lib/bridge';

function KindergartenConfirmPage() {
  const { back } = useStackNavigation();
  const { displayItems, isReady, isPending, handleNo, handleYes } = useKindergartenConfirmPage();

  const handleBack = useCallback(() => {
    if (isPending) return;
    back();
  }, [back, isPending]);

  useNativeBackHandler(handleBack);

  if (!isReady) {
    return (
      <div className='flex h-full flex-col'>
        <Header>
          <Header.BackButton onClick={handleBack} />
          <Header.Title>{kindergartenConfirmContent.headerTitle}</Header.Title>
        </Header>
        <DelayedLoadingSpinner isLoading layout='content' />
      </div>
    );
  }

  return (
    <div className='relative flex h-full flex-col'>
      <ActionLoadingOverlay isPending={isPending} />
      <Header>
        <Header.BackButton onClick={handleBack} />
        <Header.Title>{kindergartenConfirmContent.headerTitle}</Header.Title>
      </Header>

      <div className='shrink-0 px-4 py-2'>
        <ProgressBar
          totalSteps={roleConversionProgress.totalSteps}
          value={roleConversionProgress.kindergartenSearchStep}
          className='h-1.5'
        />
      </div>

      <div className='flex min-h-0 flex-1 flex-col px-4 pt-3 pb-5'>
        <div className='flex flex-col gap-5'>
          <h1 className='h1-extrabold'>
            {kindergartenConfirmContent.titleLine1}
            <br />
            {kindergartenConfirmContent.titleLine2}
          </h1>

          <KindergartenInfoSummary items={displayItems} />
        </div>

        <div className='mt-auto flex gap-2 py-5'>
          <ActionButton
            type='button'
            variant='secondaryLine'
            size='large'
            className='flex-1'
            disabled={isPending}
            onClick={handleNo}
          >
            {kindergartenConfirmContent.noButtonLabel}
          </ActionButton>
          <ActionButton
            type='button'
            variant='secondaryFill'
            size='large'
            className='flex-1'
            disabled={isPending}
            onClick={handleYes}
          >
            {kindergartenConfirmContent.yesButtonLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export { KindergartenConfirmPage };
