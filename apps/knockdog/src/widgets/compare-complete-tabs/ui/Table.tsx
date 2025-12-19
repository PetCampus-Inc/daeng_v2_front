import { RowList } from './RowList';
import { Title } from './Title';
import type { TableProps } from '@entities/compare';

function Table({ title, rows }: TableProps) {
  return (
    <div className='w-full'>
      {title && <Title>{title}</Title>}
      <RowList rows={rows} />
    </div>
  );
}

export { Table };
