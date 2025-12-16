'use client';

import { SafeArea } from '@shared/ui/safe-area';
import { Header } from '@widgets/Header';
import { IconButton } from '@knockdog/ui';
import { SaveTabs } from '@widgets/save-tabs';
import { PrivateAccess } from '@shared/ui/private-access';

export function SaveMainPage() {
  return (
    <SafeArea edges={['top']} className='flex h-dvh flex-col'>
      <Header>
        <Header.Title>보관함</Header.Title>

        <Header.RightSection>
          <IconButton icon='Search' />
        </Header.RightSection>
      </Header>

      <div className='min-h-0 flex-1'>
        <SaveTabs />
      </div>
    </SafeArea>
  );
}
