import { type ComponentProps } from 'react';

import { cn } from '@knockdog/ui/lib';

import { RsvTimetableTime, type RsvTimetableTimeState } from '../rsv-timetable-time';

interface RsvTimetableSlot {
  time?: string;
  state?: RsvTimetableTimeState;
  isReserved?: boolean;
  onSelect?: () => void;
}

interface RsvTimetableProps extends Omit<ComponentProps<'div'>, 'children'> {
  period?: string;
  slots?: RsvTimetableSlot[];
}

const DEFAULT_SLOTS = Array.from({ length: 10 }, () => ({ time: '00:00' }));

/** V4 / Reservation / Timetable */
function RsvTimetable({ period = '오전', slots = DEFAULT_SLOTS, className, ...props }: RsvTimetableProps) {
  return (
    <div className={cn('flex w-full flex-col items-start gap-x3', className)} {...props}>
      <p className='label-semibold text-text-secondary'>{period}</p>
      <div className='grid w-full grid-cols-4 gap-x1_5'>
        {slots.map((slot, index) => (
          <RsvTimetableTime
            key={`${slot.time ?? '00:00'}-${index}`}
            state={slot.state}
            isReserved={slot.isReserved}
            onClick={slot.onSelect}
          >
            {slot.time ?? '00:00'}
          </RsvTimetableTime>
        ))}
      </div>
    </div>
  );
}

export { RsvTimetable };
export type { RsvTimetableProps, RsvTimetableSlot };
