import { ActionButton } from '@knockdog/ui';
import { route } from '@shared/constants/route';

import { StackLink } from '@shared/lib/bridge';

function PetOwnershipPage() {
  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1'>
        <h1 className='h1-extrabold'>지금 돌보는 강아지가 있나요?</h1>

        <div className='mx-auto mt-15 flex aspect-square w-[70%] items-center justify-center bg-gray-100'>
          {/* 이미지 영역 */}
        </div>
      </div>

      <div className='flex gap-2'>
        <StackLink href={route.register.userNickname.root}>
          <ActionButton variant='secondaryLine' size='large' className='w-full'>
            아니오
          </ActionButton>
        </StackLink>
        <StackLink href={route.register.pet.profile.root}>
          <ActionButton variant='secondaryFill' size='large' className='w-full'>
            예
          </ActionButton>
        </StackLink>
      </div>
    </div>
  );
}

export { PetOwnershipPage };
