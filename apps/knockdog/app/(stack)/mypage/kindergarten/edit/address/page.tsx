import { Suspense } from 'react';

import { MypageOwnerKindergartenEditAddressPage } from '@views/mypage-owner-kindergarten-edit-page/ui/MypageOwnerKindergartenEditAddressPage';

export default function Page() {
  return (
    <Suspense>
      <MypageOwnerKindergartenEditAddressPage />
    </Suspense>
  );
}
