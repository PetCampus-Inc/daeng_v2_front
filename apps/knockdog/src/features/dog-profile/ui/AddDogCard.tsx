import { Icon } from '@knockdog/ui';

interface AddDogCardProps {
  dogNumber: number;
  onClick?: () => void;
}

function AddDogCard({ dogNumber, onClick }: AddDogCardProps) {
  return (
    <div
      onClick={onClick}
      className='body1-medium border-line-500 text-text-tertiary border-fill-secondary-500 flex h-[200px] w-[150px] shrink-0 flex-col items-center justify-center gap-y-2 rounded-2xl border border-dashed px-5 py-4'
    >
      <Icon icon='Plus' />
      {dogNumber}번째 강아지
    </div>
  );
}

export { AddDogCard };

