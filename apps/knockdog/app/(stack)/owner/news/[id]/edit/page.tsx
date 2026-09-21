import type { Metadata } from 'next';

import { OwnerKindergartenNewsEditPage } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsEditPage';

export const metadata: Metadata = {
  title: '소식 수정',
  description: '유치원 소식을 수정하는 화면이에요.',
};

export default function Page() {
  return <OwnerKindergartenNewsEditPage />;
}
