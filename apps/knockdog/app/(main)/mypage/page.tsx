'use client';

import { Mypage } from '@views/mypage';
import { SafeArea } from '@shared/ui/safe-area';

export default function Page() {
  return (
    <SafeArea edges={['top']} className='flex h-dvh flex-col'>
      <Mypage />
    </SafeArea>
  );
}
