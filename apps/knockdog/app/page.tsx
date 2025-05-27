'use client';

import { Button } from '@knockdog/ui';

export default function Home() {
  return (
    <div>
      <h1 className='font-suit'>똑독 견주</h1>
      <div className='h1-extrabold bg-fill-primary-500 p-x8 text-white'>
        테스트
      </div>
      <div className='p-x3 bg-fill-primary-50 radius-r2 text-size-caption1 body1-medium'>
        텍스트 테스트
      </div>
      <Button>버튼 테스트</Button>
    </div>
  );
}
