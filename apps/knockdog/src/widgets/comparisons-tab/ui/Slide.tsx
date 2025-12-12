import { RowData, RowList } from './RowList';

export interface SlideProps {
  type: string;
  rows: RowData[];
}

function Slide({ type, rows }: SlideProps) {
  return (
    <div className='min-w-full'>
      <div className='flex items-center justify-center bg-gray-50 px-2 py-3'>
        <span className='text-sm font-semibold text-neutral-700'>{type}</span>
      </div>
      <RowList rows={rows} />
    </div>
  );
}

export { Slide };
