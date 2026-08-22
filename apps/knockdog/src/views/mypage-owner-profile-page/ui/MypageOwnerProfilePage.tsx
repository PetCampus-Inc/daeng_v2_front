'use client';

import { ActionButton, Icon } from '@knockdog/ui';

import { Header } from '@widgets/Header';

import { ownerMypageContent, OwnerProfileDetailInfo, useOwnerProfile } from '@features/role-conversion';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

function MypageOwnerProfilePage() {
  const { push } = useStackNavigation();
  const { profile } = useOwnerProfile();

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{ownerMypageContent.profilePageTitle}</Header.Title>
      </Header>

      <div className='flex-1 overflow-y-auto'>
        <OwnerProfileDetailInfo profile={profile} />

        <div className='flex items-center justify-center px-4 pt-6 pb-10'>
          <ActionButton
            size='small'
            variant='tertiaryFill'
            className='w-[136px]'
            onClick={() => push({ pathname: route.mypage.profile.edit.root })}
          >
            <Icon icon='Edit' className='size-5' />
            {ownerMypageContent.editInfoButtonLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

export { MypageOwnerProfilePage };
