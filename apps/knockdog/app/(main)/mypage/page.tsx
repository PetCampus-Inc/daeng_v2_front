import type { Metadata } from 'next';

import { Mypage } from '@views/mypage';
import { SafeArea } from '@shared/ui/safe-area';

export const metadata: Metadata = {
  title: '마이페이지',
  description: '원장·보호자 마이페이지. 프로필, 유치원, 계정 설정을 관리합니다.',
};

export default function Page() {
  return (
    <SafeArea edges={['top']} className='flex h-dvh flex-col'>
      <Mypage />
    </SafeArea>
  );
}
