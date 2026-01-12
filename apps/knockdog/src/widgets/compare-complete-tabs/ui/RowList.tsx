import { Row } from './Row';
import type { RowData } from '@entities/compare';

interface RowListProps {
  rows: RowData[];
  className?: string;
  startWithWhite?: boolean;
}

function RowList({ rows, className, startWithWhite = false }: RowListProps) {
  return (
    <div className={`min-w-full overflow-hidden rounded-lg bg-white ${className}`}>
      {rows.map((row, i) => (
        <Row key={i} label={row.label} left={row.left} right={row.right} index={i} startWithWhite={startWithWhite} />
      ))}
    </div>
  );
}

export { RowList };
