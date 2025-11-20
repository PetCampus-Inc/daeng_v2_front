import { ActionButton, TextField, TextFieldInput } from '@knockdog/ui';
import { StackLink } from '@shared/lib/bridge';

function UserNicknamePage() {
  return (
    <div className='flex h-full flex-col'>
      <div className='flex flex-1 flex-col gap-6'>
        <h1 className='h1-extrabold'>
          똑독에서 활동할 <br /> 프로필을 등록해봐요
        </h1>

        <TextField label='내 별명' required>
          <TextFieldInput placeholder='최대 13자 이내, 한글, 영문, 숫자' />
        </TextField>
      </div>

      <StackLink href='/register/welcome'>
        <ActionButton variant='secondaryFill' size='large' className='w-full'>
          다음
        </ActionButton>
      </StackLink>
    </div>
  );
}

export { UserNicknamePage };
