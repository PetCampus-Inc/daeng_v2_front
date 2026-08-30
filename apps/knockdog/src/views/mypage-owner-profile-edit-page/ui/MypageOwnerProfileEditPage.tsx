'use client';

import { useCallback, useRef } from 'react';

import { Header } from '@widgets/Header';

import {
  openOwnerUnsavedExitDialog,
  ownerMypageContent,
  OwnerProfileForm,
  OwnerProfileImageUploader,
  useOwnerProfile,
} from '@features/role-conversion';
import { useStackNavigation, useNativeBackHandler } from '@shared/lib/bridge';

function MypageOwnerProfileEditPage() {
  const { back } = useStackNavigation();
  const { profile, isReady } = useOwnerProfile();
  const isDirtyRef = useRef(false);

  const handleBack = useCallback(() => {
    if (!isDirtyRef.current) {
      back?.();
      return;
    }

    openOwnerUnsavedExitDialog(() => {
      back?.();
    });
  }, [back]);

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
          onSuccess={() => back?.()}
          submitButtonText={ownerMypageContent.profileSaveButtonLabel}
          onDirtyChange={(isDirty) => {
            isDirtyRef.current = isDirty;
          }}
          renderProfileImage={({ value, onChange }) => (
            <OwnerProfileImageUploader profileImage={value} imageAlt={profile.name} onImageSelect={onChange} />
          )}
        />
      ) : null}
    </>
  );
}

export { MypageOwnerProfileEditPage };
