import { Icon } from '@knockdog/ui';

interface AddDogCardProps {
  dogNumber: number;
  onClick?: () => void;
}

function AddDogCard({ dogNumber, onClick }: AddDogCardProps) {
  return (
    <div
      onClick={onClick}
      className='bg-bg-50 body1-medium border-line-400 text-text-tertiary flex h-[200px] w-[150px] shrink-0 flex-col items-center justify-center gap-y-[34px] rounded-2xl border border-dashed pt-4 pr-5 pb-6 pl-5'
    >
      <Icon icon='Plus' />
      {dogNumber}번째 강아지
    </div>
  );
}

export { AddDogCard };
