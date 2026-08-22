'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';

import { Header } from '@widgets/Header';

import {
  TAB,
  ownerMemberProfileContent,
  type OwnerMemberProfileTab,
} from '../config/ownerMemberProfileContent';
import { useOwnerMemberProfilePage } from '../model/useOwnerMemberProfilePage';
import { DogBasicInfoSection } from './DogBasicInfoSection';
import { GuardianBasicInfoSection } from './GuardianBasicInfoSection';
import { AttendanceRecordSection } from './AttendanceRecordSection';
import { OwnerMemberProfileHeader } from './OwnerMemberProfileHeader';

function OwnerMemberProfilePage() {
  const {
    petId,
    dog,
    guardian,
    activeTab,
    setActiveTab,
    handleCopy,
    isDogLoading,
    isDogError,
    isGuardianLoading,
    isGuardianError,
  } = useOwnerMemberProfilePage();

  return (
    <div className='bg-bg-50 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{ownerMemberProfileContent.pageTitle}</Header.Title>
      </Header>

      {isDogLoading && !dog ? (
        <div className='flex min-h-0 flex-1 items-center justify-center px-4'>
          <p className='body1-regular text-text-secondary'>
            {ownerMemberProfileContent.profileLoadingText}
          </p>
        </div>
      ) : isDogError || !dog ? (
        <div className='flex min-h-0 flex-1 items-center justify-center px-4'>
          <p className='body1-regular text-text-secondary'>
            {ownerMemberProfileContent.profileErrorText}
          </p>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as OwnerMemberProfileTab)}
          className='flex min-h-0 flex-1 flex-col overflow-hidden'
        >
          <div className='bg-bg-0 shrink-0'>
            <OwnerMemberProfileHeader dog={dog} />
            <TabsList className='mt-5'>
              <TabsTrigger value={TAB.DOG}>{ownerMemberProfileContent.dogTabLabel}</TabsTrigger>
              <TabsTrigger value={TAB.GUARDIAN}>
                {ownerMemberProfileContent.guardianTabLabel}
              </TabsTrigger>
              <TabsTrigger value={TAB.ATTENDANCE}>
                {ownerMemberProfileContent.attendanceTabLabel}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto'>
            <TabsContent value={TAB.DOG}>
              <DogBasicInfoSection dog={dog} />
            </TabsContent>
            <TabsContent value={TAB.GUARDIAN}>
              {isGuardianLoading && !guardian ? (
                <div className='flex items-center justify-center px-4 py-10'>
                  <p className='body1-regular text-text-secondary'>
                    {ownerMemberProfileContent.profileLoadingText}
                  </p>
                </div>
              ) : isGuardianError || !guardian ? (
                <div className='flex items-center justify-center px-4 py-10'>
                  <p className='body1-regular text-text-secondary'>
                    {ownerMemberProfileContent.profileErrorText}
                  </p>
                </div>
              ) : (
                <GuardianBasicInfoSection guardian={guardian} onCopy={handleCopy} />
              )}
            </TabsContent>
            <TabsContent value={TAB.ATTENDANCE}>
              <AttendanceRecordSection petId={petId} />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}

export { OwnerMemberProfilePage };
