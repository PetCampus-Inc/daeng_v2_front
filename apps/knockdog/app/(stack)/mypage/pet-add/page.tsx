'use client';

import { MypagePetAddPage } from '@views/mypage-pet-add-page';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <MypagePetAddPage />
    </Suspense>
  );
}
