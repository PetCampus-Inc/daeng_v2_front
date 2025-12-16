import { ActionButton } from '@knockdog/ui';
import { useTabNavigation } from '@shared/lib/bridge';

function EmptySection() {
  const { navigateToTab } = useTabNavigation();

  const handleSearch = () => {
    navigateToTab('/');
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <div className='mb-[112px]'>
        {/* 이미지 영역 */}
        <div className='mb-5'></div>
        <p className='h3-semibold'>아직 저장한 유치원이 없어요!</p>
      </div>

      <ActionButton onClick={handleSearch}>유치원 탐색하기</ActionButton>
    </div>
  );
}

export { EmptySection };
