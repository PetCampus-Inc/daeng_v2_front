'use client';

import { useEffect } from 'react';
import { ActionButton } from '@knockdog/ui';

import { isIOS } from '@shared/lib/device';
import { SafeArea } from '@shared/ui/safe-area';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=net.knockdog.petcampus.v2';
const APP_STORE_URL = 'https://apps.apple.com/app/id6754978978';

/** 앱 링크가 모바일 브라우저로 폴백됐을 때 노출하는 스토어 이동 화면 */
function GuardianInviteAppInstallPage() {
  const storeUrl = isIOS() ? APP_STORE_URL : PLAY_STORE_URL;

  useEffect(() => {
    window.location.replace(storeUrl);
  }, [storeUrl]);

  return (
    <SafeArea className='bg-bg-0 flex h-dvh flex-col justify-between px-x4 py-x5'>
      <main className='flex flex-1 flex-col justify-center'>
        <h1 className='h2-extrabold text-text-primary'>똑독 앱 다운로드 페이지로 이동하고 있어요</h1>
      </main>

      <ActionButton size='large' onClick={() => window.location.assign(storeUrl)}>
        똑독 앱 다운로드
      </ActionButton>
    </SafeArea>
  );
}

export { GuardianInviteAppInstallPage };
