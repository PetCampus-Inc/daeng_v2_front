'use client';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';
import { OwnerKindergartenNewsCreateButton } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsCreateButton';
import { OwnerKindergartenNewsEmptyState } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsEmptyState';
import { Header } from '@widgets/Header';

/**
 * 원장 유치원 소식 페이지
 * 현재는 소식 없음(empty) 상태만 구현함.
 */
function OwnerKindergartenNewsPage() {
  return (
    <div data-testid='owner-kindergarten-news-root' className='bg-bg-50 flex h-full flex-col'>
      <div className='bg-bg-0'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>{ownerKindergartenNewsContent.pageTitle}</Header.Title>
        </Header>
      </div>

      <main className='bg-bg-50 relative flex min-h-0 flex-1 flex-col'>
        <OwnerKindergartenNewsEmptyState />
        <OwnerKindergartenNewsCreateButton />
      </main>
    </div>
  );
}

export { OwnerKindergartenNewsPage };
