import { MypagePetDetailPage } from '@views/mypage-pet-detail-page';
import { Suspense } from 'react';
export default function Page() {
  return (
    <Suspense>
      <MypagePetDetailPage />
    </Suspense>
  );
}
