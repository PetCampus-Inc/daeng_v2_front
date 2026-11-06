import type { Metadata } from 'next';

import { OwnerKindergartenNewsPage } from '@views/owner-kindergarten-news-page';

export const metadata: Metadata = {
  title: '유치원 소식',
  description: '유치원에 소식을 올리고 보호자에게 공유하는 화면이에요.',
};

export default function Page() {
  return <OwnerKindergartenNewsPage />;
}
