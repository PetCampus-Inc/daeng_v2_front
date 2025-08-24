'use client';

import { useEffect, useState } from 'react';
import { ActionButton, TextField, TextFieldInput } from '@knockdog/ui';

import { useHeaderContext } from '@widgets/Header';

export default function ProfilePage() {
  const { setTitle } = useHeaderContext();
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    setTitle('프로필 등록');
  }, [setTitle]);

  return (
    <div className='mt-[86px] px-4'>
      <div className='flex flex-col gap-y-[40px] py-5'>
        <h1 className='h1-extrabold'>
          똑독에서 활동할 <br /> 프로필을 등록해봐요
        </h1>
        <TextField label='내 별명' required>
          <TextFieldInput
            placeholder='최대 13자 이내, 한글, 영문, 숫자'
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </TextField>
      </div>

      <div className='fixed bottom-0 left-0 right-0 bg-white px-4 py-5'>
        <ActionButton variant='secondaryFill' className='w-full' disabled={nickname.length === 0}>
          다음
        </ActionButton>
      </div>
    </div>
  );
}
