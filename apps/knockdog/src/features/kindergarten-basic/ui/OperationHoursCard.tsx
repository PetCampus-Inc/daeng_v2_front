import type { OperationTime } from '@entities/kindergarten';

interface OperationHoursCardProps {
  operationTime: OperationTime;
}

function OperationHoursCard({ operationTime }: OperationHoursCardProps) {
  const { serviceTags, weekday, weekend, closedDays } = operationTime;

  return (
    <dl className='bg-primitive-neutral-50 flex flex-col gap-4 rounded-lg p-4'>
      <div>
        <dt className='body2-bold mb-1'>{serviceTags}</dt>

        <div className='mb-[4px] flex'>
          <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>평일</dt>
          <dd className='body2-regular text-text-primary'>{weekday.map((time) => time.time).join(' - ')}</dd>
        </div>

        <div className='mb-[4px] flex'>
          <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>주말</dt>
          <dd className='body2-regular text-text-primary'>{weekend.map((time) => time.breakTime).join(' - ')}</dd>
        </div>

        {closedDays.length > 0 && (
          <div className='flex'>
            <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>정기 휴무</dt>
            <dd className='body2-regular text-text-primary'>{closedDays.join(' ')}</dd>
          </div>
        )}
      </div>
    </dl>
  );
}

export { OperationHoursCard };
