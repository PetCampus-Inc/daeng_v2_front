'use client';

import { useCallback, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { Header } from '@widgets/Header';

import {
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

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>앗, 아직 저장하지 않았어요!</AlertDialogTitle>
            <AlertDialogDescription>
              지금 나가면 지금까지 쓴 내용이 사라져요.
              <br />
              저장 없이 나갈까요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>아니오</AlertDialogCancel>
            <AlertDialogAction onClick={() => back?.()}>예</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
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
