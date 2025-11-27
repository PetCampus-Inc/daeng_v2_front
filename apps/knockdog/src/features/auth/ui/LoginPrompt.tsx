import { ActionButton } from '@knockdog/ui';
import { useStackNavigation } from '@shared/lib/bridge';

function LoginPrompt() {
  const { push } = useStackNavigation();

  const handleLogin = () => {
    push({ pathname: '/auth/login' });
  };

  return (
    <div className='px-4'>
      <div className='py-5'>
        <h1 className='h1-extrabold'>
          <strong className='text-text-accent'>로그인</strong>
          하면 더 편리하게 <br /> 이용할 수 있어요!
        </h1>
      </div>
      <div className='pt-3 pb-7'>
        <ActionButton variant='primaryFill' onClick={handleLogin}>
          로그인하기
        </ActionButton>
      </div>
    </div>
  );
}

export { LoginPrompt };
