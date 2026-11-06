import { CircleAvatar } from './CircleAvatar';

interface SelectedCellProps {
  name: string;
  type: string;
  avatar?: string;
  className?: string;
}

export function SelectedCell({ name, type, avatar, className }: SelectedCellProps) {
  return (
    <div className={`flex min-w-0 items-center gap-2 px-4 py-5 ${className}`}>
      <CircleAvatar size={40} src={avatar} alt={name} />
      <div className='flex min-w-0 flex-col gap-0.5 leading-none'>
        <p className='h3-extrabold truncate'>{name}</p>
        <p className='text-text-tertiary body2-semibold truncate'>{type}</p>
      </div>
    </div>
  );
}
