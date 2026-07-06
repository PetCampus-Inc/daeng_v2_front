'use client';

import { Header } from '@widgets/Header';

import { ownerMypageContent, OwnerProfileForm, useOwnerProfile } from '@features/role-conversion';
import { useStackNavigation } from '@shared/lib/bridge';

function MypageOwnerProfileEditPage() {
  const { back } = useStackNavigation();
  const { profile } = useOwnerProfile();

  return (
    <>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{ownerMypageContent.profileEditPageTitle}</Header.Title>
      </Header>

      <OwnerProfileForm
        defaultValues={profile}
        onSuccess={() => back?.()}
        submitButtonText={ownerMypageContent.profileSaveButtonLabel}
      />
    </>
  );
}

export { MypageOwnerProfileEditPage };
