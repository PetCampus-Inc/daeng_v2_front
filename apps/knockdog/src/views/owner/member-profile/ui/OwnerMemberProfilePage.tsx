'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';

import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { Header } from '@widgets/Header';

import {
  TAB,
  ownerMemberProfileContent,
  type OwnerMemberProfileTab,
} from '../config/ownerMemberProfileContent';
import { useOwnerMemberProfilePage } from '../model/useOwnerMemberProfilePage';
import { formatProfilePhone } from '../lib/formatProfilePhone';
import { AttendanceRecordSection } from './AttendanceRecordSection';
import { DogBasicInfoSection } from './DogBasicInfoSection';
import { GuardianBasicInfoSection } from './GuardianBasicInfoSection';
import { OwnerMemberConnectionHistorySection } from './OwnerMemberConnectionHistorySection';
import { OwnerMemberProfileDisconnectButton } from './OwnerMemberProfileDisconnectButton';
import { OwnerMemberProfileHeader } from './OwnerMemberProfileHeader';
import { OwnerMemberTicketSection } from './OwnerMemberTicketSection';

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
    isDogAccessDenied,
    isGuardianLoading,
    isGuardianError,
  } = useOwnerMemberProfilePage();

  if (isDogAccessDenied) return <DelayedLoadingSpinner isLoading layout='screen' />;

  return (
    <div className='bg-bg-50 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{ownerMemberProfileContent.pageTitle}</Header.Title>
        {dog ? (
          <Header.RightSection>
            <OwnerMemberProfileDisconnectButton petId={petId} dogName={dog.name} />
          </Header.RightSection>
        ) : null}
      </Header>

      {isDogLoading && !dog ? (
        <DelayedLoadingSpinner isLoading={isDogLoading} layout='content' />
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
            <OwnerMemberProfileHeader
              dog={dog}
              phone={formatProfilePhone(guardian?.phone)}
              isPhoneReady={!isGuardianLoading}
            />
            <TabsList className='mt-5'>
              <TabsTrigger value={TAB.USAGE}>{ownerMemberProfileContent.usageTabLabel}</TabsTrigger>
              <TabsTrigger value={TAB.GUARDIAN}>
                {ownerMemberProfileContent.guardianTabLabel}
              </TabsTrigger>
              <TabsTrigger value={TAB.ATTENDANCE}>
                {ownerMemberProfileContent.attendanceTabLabel}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto'>
            <TabsContent value={TAB.USAGE}>
              <div className='flex flex-col gap-5'>
                <OwnerMemberTicketSection petId={petId} />
                <DogBasicInfoSection dog={dog} />
                <OwnerMemberConnectionHistorySection petId={petId} />
              </div>
            </TabsContent>
            <TabsContent value={TAB.GUARDIAN}>
              {isGuardianLoading && !guardian ? (
                <DelayedLoadingSpinner isLoading={isGuardianLoading} layout='content' className='py-10' />
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
