import { Icon } from '@knockdog/ui';

interface DogHouseHeaderProps {
  representativeDogName: string;
  currentCount: number;
  maxCount: number;
  onChangeRepresentative: () => void;
}

function DogHouseHeader({
  representativeDogName,
  currentCount,
  maxCount,
  onChangeRepresentative,
}: DogHouseHeaderProps) {
  return (
    <div className='px-4'>
      <div className='flex items-center gap-x-2 py-5'>
        <h1 className='h1-extrabold'>
          <strong className='text-text-accent'>{representativeDogName}</strong>네 집
        </h1>
        <Icon icon='Rooftop' className='size-8' />
      </div>
      <div className='mb-2 flex items-center justify-between py-2'>
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

