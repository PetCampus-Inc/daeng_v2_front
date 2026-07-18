'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { SafeArea } from '@shared/ui/safe-area';

import {
  TAB,
  ownerMemberProfileContent,
  type OwnerMemberProfileTab,
} from '../config/ownerMemberProfileContent';
import { useOwnerMemberProfilePage } from '../model/useOwnerMemberProfilePage';
import { GuardianBasicInfoSection } from './GuardianBasicInfoSection';
import { OwnerMemberProfileHeader } from './OwnerMemberProfileHeader';

function OwnerMemberProfilePage() {
  const { profile, activeTab, setActiveTab, handleCopy } = useOwnerMemberProfilePage();

  return (
    <SafeArea edges={['bottom']} className='bg-bg-50 flex h-dvh flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{ownerMemberProfileContent.pageTitle}</Header.Title>
      </Header>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as OwnerMemberProfileTab)}
        className='flex min-h-0 flex-1 flex-col overflow-hidden'
      >
        <div className='bg-bg-0 shrink-0'>
          <OwnerMemberProfileHeader dog={profile.dog} />
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
          <TabsContent value={TAB.DOG} />
          <TabsContent value={TAB.GUARDIAN}>
            <GuardianBasicInfoSection guardian={profile.guardian} onCopy={handleCopy} />
          </TabsContent>
          <TabsContent value={TAB.ATTENDANCE} />
        </div>
      </Tabs>
    </SafeArea>
  );
}

export { OwnerMemberProfilePage };
