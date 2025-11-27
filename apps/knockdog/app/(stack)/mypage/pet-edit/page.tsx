import { MypagePetEditPage } from '@views/mypage-pet-edit-page';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <MypagePetEditPage />
    </Suspense>
  );
}
