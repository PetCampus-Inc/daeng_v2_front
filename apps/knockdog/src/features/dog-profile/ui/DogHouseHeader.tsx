import { Icon } from '@knockdog/ui';

interface DogHouseHeaderProps {
  currentCount: number;
  maxCount: number;
  onChangeRepresentative: () => void;
}

function DogHouseHeader({
  currentCount,
  maxCount,
  onChangeRepresentative,
}: DogHouseHeaderProps) {
  return (
    <div className='px-4'>
      <div className='flex items-center justify-between py-4'>
        <span className='body1-medium'>
          총 <strong className='text-text-accent'>{currentCount}</strong>/{maxCount} 마리
        </span>

        <button onClick={onChangeRepresentative} className='label-semibold flex items-center gap-x-1'>
          대표 강아지 변경
          <Icon icon='ChevronRight' className='size-4' />
        </button>
      </div>
    </div>
  );
}

export { DogHouseHeader };
