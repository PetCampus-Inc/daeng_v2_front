import { RowData, RowList } from './RowList';
import { Title } from './Title';

interface TableProps {
  title: string;
  rows: RowData[];
}

function Table({ title, rows }: TableProps) {
  return (
    <div className='w-full'>
      {title && <Title>{title}</Title>}
      <RowList rows={rows} />
    </div>
  );
}

export { Table };
