'use client';

import { useRouter } from 'next/navigation';
import { SearchView } from '../../../search/ui/SearchView';

export default function Page() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  console.log('⚠️ 모달 검색 페이지 로드됨');

  return (
    <div className='absolute inset-0 z-[100]'>
      <SearchView handleBack={handleBack} />
    </div>
  );
}
