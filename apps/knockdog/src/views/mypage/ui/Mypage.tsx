'use client';

import { Header } from '@widgets/Header';
import { Divider, IconButton } from '@knockdog/ui';
import { overlay } from 'overlay-kit';
import { useStackNavigation } from '@shared/lib/bridge';
import { DogSelectSheet, DogHouseSection, NoDogPrompt } from '@features/dog-profile';
import { LoginPrompt } from '@features/auth';
import { AccountSection, type AccountInfo } from '@features/user-account';
import { QuickActionsSection } from '@features/support';
import { SettingsSection } from '@features/app-settings';
import { useUserStore } from '@entities/user/model/store/useUserStore';
import { usePetListQuery } from '@entities/pet';

function Mypage() {
  const { push } = useStackNavigation();
  const user = useUserStore((state) => state.user);

  const { data: petListResponse } = usePetListQuery();

  const openDogSelectSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <DogSelectSheet isOpen={isOpen} close={close} dogs={petListResponse?.data || []} />
    ));
  };

  const isLoggedIn = !!user;
  const hasDogs = (petListResponse?.data?.length ?? 0) > 0;

  const accountInfo: AccountInfo = {
    nickname: user?.nickname || '살구형',
    userId: user?.id || '123456',
  };

  const handleDogClick = (petId: string) => {
    push({ pathname: '/mypage/pet-detail', query: { petId } });
  };

  const handleAddDog = () => {
    push({ pathname: '/mypage/pet-add' });
  };

  return (
    <div className='flex h-screen flex-col'>
      <Header withSpacing={false}>
        <Header.Title>마이페이지</Header.Title>
        <Header.RightSection>
          <IconButton icon='AlarmLine' />
        </Header.RightSection>
      </Header>

      <div className='mb-16 flex-1 overflow-y-auto'>
        {!isLoggedIn && <LoginPrompt />}

        {isLoggedIn && !hasDogs && (
          <NoDogPrompt nickname={user?.nickname || '사용자'} onAddDog={() => push({ pathname: '/mypage/pet-add' })} />
        )}

        {isLoggedIn && hasDogs && (
          <DogHouseSection
            dogs={petListResponse?.data || []}
            onChangeRepresentative={openDogSelectSheet}
            onDogClick={handleDogClick}
            onAddDog={handleAddDog}
          />
        )}

        <Divider size='thick' />

        {isLoggedIn && (
          <div className='pt-4'>
            <AccountSection
              accountInfo={accountInfo}
              onAccountClick={() => push({ pathname: '/mypage/profile/manage' })}
              onLocationClick={() => push({ pathname: '/mypage/profile/location' })}
            />
          </div>
        )}

        <QuickActionsSection />

        <SettingsSection
          version='v1.0.000'
          hasUpdate
          onNotificationClick={() => push({ pathname: '/alarm-setting' })}
          onTermsClick={() => push({ pathname: '/terms' })}
        />
      </div>
    </div>
  );
}

export { Mypage };
