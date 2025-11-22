'use client';

import { useState } from 'react';
import { Icon, TextField, TextFieldInput, ActionButton } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';

function PetProfilePage() {
  const { push } = useStackNavigation();
  const [petName, setPetName] = useState('');

  const handleNext = () => push({ pathname: '/register/pet/relationship', query: { petName } });

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1'>
        <h1 className='h1-extrabold'>
          <span className='text-text-accent'>강아지 사진과 이름</span>을 알려주세요
        </h1>

        <div className='bg-primitive-neutral-50 relative mx-auto mt-9 aspect-square w-30 rounded-full'>
          {/* 사진 프리뷰 이미지 */}

          <div className='absolute right-0 bottom-0 flex items-center justify-center rounded-full bg-white p-1'>
            <Icon icon='Camera' className='size-7' />
          </div>
        </div>

        <div className='mt-7'>
          <TextField label='강아지 이름' required>
            <TextFieldInput placeholder='8자 이내 한글' value={petName} onChange={(e) => setPetName(e.target.value)} />
          </TextField>
        </div>
      </div>

      <ActionButton variant='secondaryFill' className='w-full' size='large' disabled={!petName} onClick={handleNext}>
        다음
      </ActionButton>
    </div>
  );
}

export { PetProfilePage };
