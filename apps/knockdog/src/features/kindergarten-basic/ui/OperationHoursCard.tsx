import type { OperationTime } from '@entities/kindergarten';
import { DAY_OF_WEEK } from '@shared/constants';

interface OperationHoursCardProps {
  operationTime: OperationTime;
}

const OPERATION_HOURS_SERVICE_TAG_MAP = {
  DEFAULT: '기본 영업 시간',
  KINDERGARTEN: '유치원 운영 시간',
};

function OperationHoursCard({ operationTime }: OperationHoursCardProps) {
  const { serviceTags, weekday, weekend, closedDays } = operationTime;

  return (
    <dl className='bg-primitive-neutral-50 flex flex-col gap-4 rounded-lg p-4'>
      <div>
        <dt className='body2-bold mb-1'>
          {OPERATION_HOURS_SERVICE_TAG_MAP[serviceTags as keyof typeof OPERATION_HOURS_SERVICE_TAG_MAP]}
        </dt>

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
            <dd className='body2-regular text-text-primary'>
              {closedDays.map((day) => DAY_OF_WEEK[day as keyof typeof DAY_OF_WEEK]).join('·')}
            </dd>
          </div>
        )}
      </div>
    </dl>
  );
}

export { OperationHoursCard };
