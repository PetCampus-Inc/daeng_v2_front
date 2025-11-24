'use client';

import { useUserStore } from '@entities/user';
import { ActionButton, TextField, TextFieldInput } from '@knockdog/ui';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

function UserNicknamePage() {
  const user = useUserStore((state) => state.user);
  const { push } = useStackNavigation();

  const handleNext = () => {
    // TODO: 닉네임 변경 API 호출
    push({ pathname: route.register.welcome.root });
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex flex-1 flex-col gap-6'>
        <h1 className='h1-extrabold'>
          똑독에서 활동할 <br /> 프로필을 등록해봐요
        </h1>

        <TextField label='내 별명' required>
          <TextFieldInput placeholder='최대 13자 이내, 한글, 영문, 숫자' value={user?.nickname || ''} />
        </TextField>
      </div>

      <ActionButton variant='secondaryFill' size='large' className='w-full' onClick={handleNext}>
        다음
      </ActionButton>
    </div>
  );
}

export { UserNicknamePage };
