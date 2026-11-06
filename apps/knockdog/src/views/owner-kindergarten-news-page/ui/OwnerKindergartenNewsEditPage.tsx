'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import { OwnerKindergartenNewsComposer } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsWritePage';

function OwnerKindergartenNewsEditPageContent() {
  const params = useParams<{ id: string }>();
  const newsId = typeof params.id === 'string' ? params.id : '';

  return <OwnerKindergartenNewsComposer mode='edit' newsId={newsId} />;
}

/** 소식 수정 — 등록(write)과 동일 컴포저, 알림 토글 기본 OFF */
function OwnerKindergartenNewsEditPage() {
  return (
    <Suspense fallback={null}>
      <OwnerKindergartenNewsEditPageContent />
    </Suspense>
  );
}

export { OwnerKindergartenNewsEditPage };
