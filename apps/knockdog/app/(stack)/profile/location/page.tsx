'use client';

import { useEffect } from 'react';
import { ActionButton, Divider } from '@knockdog/ui';
import { useHeaderContext } from '@widgets/Header';
import { LocationField } from '@features/location-field';
import { USER_ADDRESS_TYPE } from '@entities/user';

export default function LocationPage() {
  const { setTitle } = useHeaderContext();

  useEffect(() => {
    setTitle('프로필 등록');
  }, [setTitle]);

  return (
    <div className='mt-[86px] px-4'>
      <div className='flex flex-col gap-y-[40px] py-5'>
        <h1 className='h1-extrabold'>
          강아지 유치원, <br />
          어디 기준으로 찾아볼까요?
        </h1>
        <div className='flex flex-col'>
          <LocationField type={USER_ADDRESS_TYPE.HOME} required />
          <Divider />
          <LocationField type={USER_ADDRESS_TYPE.WORK} />
          <Divider />
          <LocationField type={USER_ADDRESS_TYPE.OTHER} />
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 bg-white px-4 py-5'>
        <ActionButton variant='secondaryFill' size='large' className='w-full'>
          다음으로
        </ActionButton>
      </div>
    </div>
  );
}
