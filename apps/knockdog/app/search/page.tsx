'use client';

import { useRouter } from 'next/navigation';
import { SearchView } from './ui/SearchView';

export default function Page() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  console.log('⚠️ 전체 검색 페이지 로드됨');

  return <SearchView handleBack={handleBack} />;
}
