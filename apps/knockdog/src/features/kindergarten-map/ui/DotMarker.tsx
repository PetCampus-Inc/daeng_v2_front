import { cn } from '@knockdog/ui/lib';

interface DotMarkerProps {
  className?: string;
  verified?: boolean;
}

/** 축소 지도용 업체 점 마커 */
export function DotMarker({ className, verified = false }: DotMarkerProps) {
  return (
    <div className={className}>
      <svg xmlns='http://www.w3.org/2000/svg' className='size-x3' viewBox='0 0 12 12' fill='none'>
        <circle
          className={cn(verified ? 'fill-fill-primary-500' : 'fill-fill-secondary-600', 'stroke-fill-secondary-0')}
          cx='6'
          cy='6'
          r='5'
          strokeWidth='2'
        />
      </svg>
    </div>
  );
}
