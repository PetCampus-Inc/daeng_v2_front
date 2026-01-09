import { ActionButton } from '@knockdog/ui';
import Image from 'next/image';
import { useTabNavigation } from '@shared/lib/bridge';

function EmptySection() {
  const { navigateToTab } = useTabNavigation();

  const handleSearch = () => {
    navigateToTab('/');
  };

  return (
    <div className='flex flex-1 flex-col justify-between'>
      <div className='mt-[70px] flex flex-col items-center'>
        <Image
          src='/images/img_savednon.png'
          alt='저장된 유치원 없음'
          className='mx-auto mb-5'
          width={200}
          height={200}
        />
        <p className='h3-semibold'>아직 저장한 유치원이 없어요!</p>
      </div>

      <div className='mb-12'>
        <ActionButton onClick={handleSearch}>유치원 탐색하기</ActionButton>
      </div>
    </div>
  );
}

export { EmptySection };
