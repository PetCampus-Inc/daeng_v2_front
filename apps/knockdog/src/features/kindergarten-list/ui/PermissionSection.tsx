import { ActionButton, Icon } from '@knockdog/ui';
import Image from 'next/image';

import { getCurrentLocation } from '@shared/lib';

export function PermissionSection() {
  const handlePermissionCheck = async () => {
    // 권한 설정 다이얼로그 열기
    await getCurrentLocation.openPermissionDialog();
  };

  return (
    <div className='flex h-full w-full items-center'>
      <div className='px-x4 py-x8 flex w-full flex-col items-center justify-center'>
        <div className='mb-[18px] flex items-center justify-center'>
          <Image
            src='/images/img_location.png'
            alt='위치 권한설정 이미지'
            width={200}
            height={200}
            priority
            className='h-auto max-h-[200px] w-auto max-w-[200px]'
          />
        </div>

        <div className='mb-[48px] text-center'>
          <p className='text-text-primary h3-semibold leading-relaxed'>위치 권한을 허용하시면</p>
          <p className='text-text-primary h3-semibold leading-relaxed'>근처 유치원을 추천해드릴 수 있어요</p>
        </div>

        <ActionButton variant='secondaryFill' size='large' onClick={handlePermissionCheck}>
          <Icon icon='Plus' className='size-x5' />
          위치 권한설정 변경하기
        </ActionButton>
      </div>
    </div>
  );
}
