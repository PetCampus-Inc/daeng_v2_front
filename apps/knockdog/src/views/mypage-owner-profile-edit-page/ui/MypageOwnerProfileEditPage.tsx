'use client';

import { useCallback, useRef, useState } from 'react';

import { Header } from '@widgets/Header';

import {
  openOwnerUnsavedExitDialog,
  ownerMypageContent,
  OwnerProfileForm,
  OwnerProfileImageUploader,
  useOwnerProfile,
} from '@features/role-conversion';
import { useStackNavigation, useNativeBackHandler } from '@shared/lib/bridge';
import { useUnsavedBrowserBackGuard } from '@shared/lib/useUnsavedBrowserBackGuard';
import { PageError } from '@shared/ui/page-error';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

function MypageOwnerProfileEditPage() {
  const { back } = useStackNavigation();
  const { profile, isReady, isError, isFetching, refetch } = useOwnerProfile();
  const [isDirty, setIsDirty] = useState(false);
  const handleBackRef = useRef(() => {});

  const { releaseAndLeave } = useUnsavedBrowserBackGuard(isDirty, () => {
    handleBackRef.current();
  });

  const leavePage = useCallback(() => {
    releaseAndLeave(() => {
      back?.();
    });
  }, [back, releaseAndLeave]);

  const handleBack = useCallback(() => {
    if (!isDirty) {
      leavePage();
      return;
    }

    openOwnerUnsavedExitDialog(leavePage);
  }, [isDirty, leavePage]);

  handleBackRef.current = handleBack;
  useNativeBackHandler(handleBack);

  return (
    <>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={handleBack} />
        </Header.LeftSection>
        <Header.Title>{ownerMypageContent.profileEditPageTitle}</Header.Title>
      </Header>

      {isReady ? (
        <OwnerProfileForm
          defaultValues={profile}
          onSuccess={leavePage}
          submitButtonText={ownerMypageContent.profileSaveButtonLabel}
          onDirtyChange={setIsDirty}
          renderProfileImage={({ value, onChange }) => (
            <OwnerProfileImageUploader profileImage={value} imageAlt={profile.name} onImageSelect={onChange} />
          )}
        />
      ) : isError ? (
        <PageError layout='inline' onRetry={refetch} isRetrying={isFetching} />
      ) : (
        <DelayedLoadingSpinner isLoading={!isReady} layout='content' />
      )}
    </>
  );
}

export { MypageOwnerProfileEditPage };
