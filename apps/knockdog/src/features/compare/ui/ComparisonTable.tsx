import { ServiceTagBadge } from './ServiceBadge';

interface ComparisonTableProps {
  title: string;
  cols: string[][];
}

function ComparisonTable({ title, cols }: ComparisonTableProps) {
  return (
    <div className='min-w-full overflow-hidden bg-white'>
      <div className='flex items-center justify-center border border-neutral-100 bg-gray-50 p-2.5'>
        <div className='caption1-regular text-sm font-semibold text-neutral-600'>{title}</div>
      </div>

      <div
        className={`grid ${cols.length === 1 ? 'grid grid-cols-1' : 'grid grid-cols-2'} border border-t-0 border-neutral-100`}
      >
        {cols.map((services, index) => (
          <div
            key={index}
            className={`grid ${cols.length === 1 ? 'grid grid-cols-4' : 'grid grid-cols-2'} content-start items-start gap-4 p-4 ${index < cols.length - 1 ? 'border-r border-neutral-100' : ''}`}
          >
            {services.map((service) => (
              <ServiceTagBadge key={service} code={service} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export { ComparisonTable };
