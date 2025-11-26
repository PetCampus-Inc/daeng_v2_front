import { MypageProfileLocationPage } from '@views/mypage-profile-location-page';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <MypageProfileLocationPage />
    </Suspense>
  );
}
