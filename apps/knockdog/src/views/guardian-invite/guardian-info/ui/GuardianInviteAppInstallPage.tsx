'use client';

import { useEffect } from 'react';
import { ActionButton } from '@knockdog/ui';

import { isAndroid, isIOS } from '@shared/lib/device';
import { SafeArea } from '@shared/ui/safe-area';
import { toast } from '@shared/ui/toast';

const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? 'https://play.google.com/store/apps/details?id=net.knockdog.petcampus.v2';
const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? 'https://apps.apple.com/app/id6754978978';

/** 앱 링크를 브라우저로 연 사용자에게 표시하는 설치 안내 화면 */
function GuardianInviteAppInstallPage() {
  const storeUrl = isIOS() ? APP_STORE_URL : isAndroid() ? PLAY_STORE_URL : undefined;

  useEffect(() => {
    if (storeUrl) {
      window.location.replace(storeUrl);
    }
  }, [storeUrl]);

  const handleDownload = () => {
    if (!storeUrl) {
      toast('똑독 앱을 설치한 뒤 초대 링크를 다시 열어 주세요.');
      return;
    }

    window.location.assign(storeUrl);
  };

  return (
    <SafeArea className='bg-bg-0 flex h-dvh flex-col justify-between px-x4 py-x5'>
      <main className='flex flex-1 flex-col justify-center'>
        <h1 className='h2-extrabold text-text-primary'>똑독 앱에서 초대를 확인해 주세요</h1>
        <p className='body1-medium mt-2 text-text-secondary'>
          {storeUrl
            ? '똑독 앱 다운로드 페이지로 이동하고 있어요.'
            : '보호자 연결 신청은 똑독 앱에서 진행할 수 있어요. 앱을 설치한 뒤 이 초대 링크를 다시 열어 주세요.'}
        </p>
      </main>

      {storeUrl ? (
        <ActionButton size='large' onClick={handleDownload}>
          똑독 앱 다운로드
        </ActionButton>
      ) : null}
    </SafeArea>
  );
}

export { GuardianInviteAppInstallPage };
