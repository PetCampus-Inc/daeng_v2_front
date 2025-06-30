import React from 'react';
import { Icon, Divider, ActionButton } from '@knockdog/ui';

export default function PermissionPage() {
  return (
    <>
      <div className='mt-5 px-4'>
        <div className='py-5'>
          <h1 className='h1-extrabold mb-[32px]'>
            똑독을 사용하기 위해 <br />
            아래의 권한 허용이 필요해요
          </h1>
          <div className='bg-primitive-neutral-50 flex flex-col rounded-xl p-5'>
            <div>
              <div className='body1-bold flex items-center gap-x-1'>
                <Icon icon='Currentlocation' className='text-text-primary' />
                위치
              </div>
              <span className='text-text-secondary body2-regular'>
                주변 강아지 유치원 검색을 위해 필요해요.
              </span>
            </div>
            <Divider className='my-5' />
            <div>
              <div className='body1-bold flex items-center gap-x-1'>
                <Icon icon='Camera' />
                카메라
              </div>
              <span className='text-text-secondary body2-regular'>
                상담 메모, 오류 제보 등 사진 촬영 기능에 필요해요.
              </span>
            </div>
            <Divider className='my-5' />
            <div>
              <div className='body1-bold flex items-center gap-x-1'>
                <Icon icon='Gallery' />
                사진
              </div>
              <span className='text-text-secondary body2-regular'>
                촬영한 사진을 저장하거나 불러올 때 필요해요.
              </span>
            </div>
            <Divider className='my-5' />
            <div>
              <div className='body1-bold flex items-center gap-x-1'>
                <Icon icon='Alram' />
                알림
              </div>
              <span className='text-text-secondary body2-regular'>
                서비스 업데이트 등 알림 제공을 위해 필요해요.
              </span>
            </div>
          </div>
        </div>
        <div className='fixed bottom-[58px] left-0 right-0 bg-white p-4'>
          <ActionButton variant='secondaryFill' className='w-full'>
            확인
          </ActionButton>
        </div>
      </div>
    </>
  );
}
