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
    <div className='flex items-center justify-between gap-x-2 px-4'>
      <span className='body1-medium text-text-primary flex items-center gap-x-1'>
        총
        <span>
          <strong className='text-text-accent font-extrabold'>{currentCount}</strong>
          <strong className='font-bold'>/{maxCount}</strong>
        </span>
        마리
      </span>

      <button
        type='button'
        onClick={onChangeRepresentative}
        className='body2-semibold text-primitive-neutral-500 flex items-center gap-x-1'
      >
        대표 강아지 변경
        <Icon icon='ChevronRight' className='size-4' />
      </button>
    </div>
  );
}

export { DogHouseHeader };
