'use client';

import { Header } from '@widgets/Header';

import { ownerMypageContent, OwnerProfileDetailInfo, useOwnerProfile } from '@features/role-conversion';
import { SafeArea } from '@shared/ui/safe-area';

function MypageOwnerProfilePage() {
  const { profile } = useOwnerProfile();

  return (
    <SafeArea edges={['bottom']} className='flex h-screen flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{ownerMypageContent.profilePageTitle}</Header.Title>
      </Header>

      <div className='flex-1 overflow-y-auto'>
        <OwnerProfileDetailInfo profile={profile} />
      </div>
    </SafeArea>
  );
}

export { MypageOwnerProfilePage };
