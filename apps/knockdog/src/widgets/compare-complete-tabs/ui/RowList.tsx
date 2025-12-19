import { Row } from './Row';
import type { RowData } from '@entities/compare';

function RowList({ rows, className }: { rows: RowData[]; className?: string }) {
  return (
    <div className={`min-w-full overflow-hidden rounded-lg bg-white ${className}`}>
      {rows.map((row, i) => (
        <Row key={i} label={row.label} left={row.left} right={row.right} />
      ))}
    </div>
  );
}

export { RowList };
