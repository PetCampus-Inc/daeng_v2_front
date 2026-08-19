'use client';

import { useAppOpenLanding } from '@views/app-open-landing-page/model/useAppOpenLanding';

/** 앱 링크가 모바일 브라우저로 폴백됐을 때 앱 오픈을 시도한 뒤 스토어로 이동하는 화면 */
function GuardianInviteAppInstallPage() {
  useAppOpenLanding();

  return <div className='bg-bg-0 h-dvh' />;
}

export { GuardianInviteAppInstallPage };
