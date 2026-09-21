'use client';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { Header } from '@widgets/Header';

/** 소식 수정 작성/수정 UI는 이후 연동 */
function OwnerKindergartenNewsEditPage() {
  return (
    <div className='bg-bg-50 flex h-full flex-col'>
      <div className='bg-bg-0'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>{ownerKindergartenNewsContent.editPageTitle}</Header.Title>
        </Header>
      </div>
      <main className='flex min-h-0 flex-1 items-center justify-center px-4'>
        <p className='body1-regular text-text-secondary text-center'>소식 수정 화면은 준비 중이에요.</p>
      </main>
    </div>
  );
}

export { OwnerKindergartenNewsEditPage };
