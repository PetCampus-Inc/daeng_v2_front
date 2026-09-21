import type { Metadata } from 'next';

import { OwnerKindergartenNewsWritePage } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsWritePage';

export const metadata: Metadata = {
  title: '소식 등록',
  description: '유치원 소식을 등록하는 화면이에요.',
};

export default function Page() {
  return <OwnerKindergartenNewsWritePage />;
}
