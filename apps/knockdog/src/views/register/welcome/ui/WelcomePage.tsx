import { ActionButton } from '@knockdog/ui';
import Image from 'next/image';
import { StackLink } from '@shared/lib/bridge';

function WelcomePage() {
  return (
    <div className='flex h-full flex-col px-4 pt-26'>
      <div className='flex-1'>
        <h1 className='h1-extrabold'>똑독에 온 것을 환영해요!</h1>

        <div className='relative mx-16 mt-15 flex aspect-square items-center justify-center'>
          <Image src='/images/img_welcome.png' alt='welcome_image' fill className='h-full w-full object-cover' />
        </div>
      </div>

      <div className='py-5'>
        <StackLink href='/register/marketing-consent'>
          <ActionButton className='w-full' size='large'>
            시작하기
          </ActionButton>
        </StackLink>
      </div>
    </div>
  );
}

export { WelcomePage };
