'use client';

import { Header } from '@widgets/Header';

export default function ProfileRegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>프로필 등록</Header.Title>
      </Header>

      <div className='relative flex-1 overflow-hidden px-4 pt-12 pb-5'>{children}</div>
    </div>
  );
}
