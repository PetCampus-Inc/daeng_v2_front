'use client';

import { useState } from 'react';
import { Icon, TextField, TextFieldInput, ActionButton } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';
import { ProfileImageUploader } from '@features/dog-profile';

function PetProfilePage() {
  const { push } = useStackNavigation();
  const [petName, setPetName] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const handleNext = () => push({ pathname: route.register.pet.relationship.root, query: { petName, profileImage } });

  return (
    <div className='flex h-full flex-col'>
      <div className='flex-1'>
        <h1 className='h1-extrabold'>
          <span className='text-text-accent'>강아지 사진과 이름</span>을 알려주세요
        </h1>

        <ProfileImageUploader profileImage={profileImage} onImageSelect={(uri) => setProfileImage(uri)} />

        <div className='mt-7'>
          <TextField label='강아지 이름' required>
            <TextFieldInput
              placeholder='8자 이내 한글'
              value={petName}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '').slice(0, 8);
                setPetName(value);
              }}
            />
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
