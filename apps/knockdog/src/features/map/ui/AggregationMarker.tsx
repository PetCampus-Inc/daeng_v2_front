interface AggregationMarkerProps {
  label: string;
  count: number;
}

export function AggregationMarker({ label, count }: AggregationMarkerProps) {
  return (
    <div className='px-x2 py-x1_5 gap-x0_5 radius-full shadow-line-accent bg-fill-secondary-0 inline-flex whitespace-nowrap shadow-[0_0_0_2px]'>
      <span className='caption1-semibold text-text-primary'>{label}</span>
      <span className='caption1-extrabold text-text-accent'>{count}</span>
    </div>
  );
}
