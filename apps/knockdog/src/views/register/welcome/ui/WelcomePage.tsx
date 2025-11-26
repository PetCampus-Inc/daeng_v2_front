import { ActionButton } from '@knockdog/ui';
import { StackLink } from '@shared/lib/bridge';

function WelcomePage() {
  return (
    <div className='flex h-full flex-col px-4 pt-26'>
      <div className='flex-1'>
        <h1 className='h1-extrabold'>똑독에 온 것을 환영해요!</h1>

        <div className='mt-15 flex aspect-square w-full items-center justify-center bg-gray-100'>
          {/* 이미지 영역 */}
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
