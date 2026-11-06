import type { CellData } from '@entities/compare';

interface RowProps {
  label: string;
  left: CellData;
  right: CellData;
  index: number;
  startWithWhite?: boolean;
}

function Row({ label, left, right, index, startWithWhite = false }: RowProps) {
  const isGray = startWithWhite ? index % 2 === 1 : index % 2 === 0;

  return (
    <div className={`grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] ${isGray ? 'bg-gray-50' : ''}`}>
      <div className='flex min-w-0 flex-col items-center justify-center p-4'>
        <div className='font-semibold'>{left.value}</div>
        {left.detail && <div className='mt-0.5 w-full truncate text-center text-sm'>{left.detail}</div>}
      </div>
      <div className='flex items-center justify-center p-1.5'>
        <div className='caption1-regular text-center text-sm font-semibold whitespace-pre-line text-neutral-600'>
          {label}
        </div>
      </div>
      <div className='flex min-w-0 flex-col items-center justify-center p-4'>
        <div className='font-semibold'>{right.value}</div>
        {right.detail && <div className='mt-0.5 w-full truncate text-center text-sm'>{right.detail}</div>}
      </div>
    </div>
  );
}

export { Row };
