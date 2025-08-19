import React from 'react';

// @TODO 데이터 구조 변경될 예정이라 퍼블 작업 그대로..
export function BusinessHours() {
  return (
    <div>
      <div className='mb-3'>
        <span className='body1-bold'>운영시간</span>
      </div>
      <dl className='bg-primitive-neutral-50 flex flex-col gap-4 rounded-lg p-4'>
        <div>
          <dt className='body2-bold mb-1'>평일</dt>

          <div className='mb-[4px] flex'>
            <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>운영시간</dt>
            <dd className='body2-regular text-text-primary'>08:00 - 20:00</dd>
          </div>

          <div className='mb-[4px] flex'>
            <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>브레이크 타임</dt>
            <dd className='body2-regular text-text-primary'>12:00 - 14:00</dd>
          </div>
        </div>
        <div>
          <dt className='body2-bold mb-1'>주말</dt>

          <div className='mb-[4px] flex'>
            <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>운영시간</dt>
            <dd className='body2-regular text-text-primary'>08:00 - 20:00</dd>
          </div>

          <div className='mb-[4px] flex'>
            <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>브레이크 타임</dt>
            <dd className='body2-regular text-text-primary'>12:00 - 14:00</dd>
          </div>
        </div>
        <div className='flex'>
          <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>정기 휴무일</dt>
          <dd className='body2-regular text-text-primary'>목요일 공휴일</dd>
        </div>
      </dl>
    </div>
  );
}
