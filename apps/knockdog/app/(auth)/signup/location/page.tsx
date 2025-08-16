'use client';

import { useEffect } from 'react';
import { ActionButton, Divider, Icon } from '@knockdog/ui';
import Link from 'next/link';
import { useHeaderContext } from '@widgets/Header';

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
          <div className='flex flex-col gap-y-2 py-5'>
            <h2 className='h3-extrabold'>
              집<span className='body1-extrabold text-text-accent'>*</span>
            </h2>
            <div className='text-text-tertiary body1-bold flex items-center gap-x-1'>
              <Icon icon='Plus' className='h-5 w-5' />
              추가하기
            </div>
          </div>
          <Divider />
          <div className='flex flex-col gap-y-2 py-5'>
            <h2 className='h3-extrabold'>
              회사
              <span className='body1-medium text-text-secondary'> (선택)</span>
            </h2>
            <Link href='/signup/location/add'>
              <div className='text-text-tertiary body1-bold flex items-center gap-x-1'>
                <Icon icon='Plus' className='h-5 w-5' />
                추가하기
              </div>
            </Link>
          </div>
          <Divider />
          <div className='flex flex-col gap-y-2 py-5'>
            <div className='flex items-center justify-between'>
              <h2 className='h3-extrabold'>
                기타
                <span className='body1-medium text-text-secondary'>
                  {' '}
                  (선택)
                </span>
              </h2>
              <div className='flex items-center'>
                <div className='label-semibold text-text-tertiary flex items-center gap-x-1'>
                  <Icon icon='Trash' className='h-5 w-5' />
                  삭제
                </div>
                <Divider
                  orientation='vertical'
                  className='border-line-200 mx-1 h-[14px]'
                />
                <Link href='/signup/location/edit'>
                  <div className='label-semibold text-text-tertiary flex items-center gap-x-1'>
                    <Icon icon='Edit' className='h-5 w-5' />
                    수정
                  </div>
                </Link>
              </div>
            </div>
            <div className='text-text-primary body1-regular'>
              서울특별시 강남구 테헤란로 지하 156 (역삼동, 역삼역)
              가나다라마바사아자차카타파하
            </div>
          </div>
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 bg-white px-4 py-5'>
        <ActionButton variant='secondaryFill' className='w-full'>
          다음으로
        </ActionButton>
      </div>
    </div>
  );
}
