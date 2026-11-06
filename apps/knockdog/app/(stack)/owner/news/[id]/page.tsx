import type { Metadata } from 'next';

import { OwnerKindergartenNewsDetailPage } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsDetailPage';

export const metadata: Metadata = {
  title: '유치원 소식',
  description: '유치원 소식 상세 화면이에요.',
};

export default function Page() {
  return <OwnerKindergartenNewsDetailPage />;
}
