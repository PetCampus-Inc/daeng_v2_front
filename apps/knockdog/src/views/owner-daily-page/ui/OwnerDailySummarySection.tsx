import type { OwnerDailySummaryItem } from '@views/owner-daily-page/config/ownerDailyContent';
import { OwnerDailyDateNav } from '@views/owner-daily-page/ui/OwnerDailyDateNav';

interface OwnerDailySummarySectionProps {
  dateLabel: string;
  summaryItems: OwnerDailySummaryItem[];
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenDatePicker: () => void;
  onGoToday: () => void;
  isNextDayDisabled: boolean;
  isToday: boolean;
}

function OwnerDailySummarySection({
  dateLabel,
  summaryItems,
  onPrevDay,
  onNextDay,
  onOpenDatePicker,
  onGoToday,
  isNextDayDisabled,
  isToday,
}: OwnerDailySummarySectionProps) {
  return (
    <section className='bg-bg-0 flex w-full flex-col gap-4 pt-4 pb-4'>
      <div className='flex h-[26px] w-full gap-4 px-4'>
        <OwnerDailyDateNav
          label={dateLabel}
          onPrevDay={onPrevDay}
          onNextDay={onNextDay}
          onOpenDatePicker={onOpenDatePicker}
          onGoToday={onGoToday}
          isNextDayDisabled={isNextDayDisabled}
          isToday={isToday}
        />
      </div>
      <div className='flex h-[88px] w-full gap-2.5 px-4'>
        <div className='bg-bg-50 radius-r3 flex h-full w-full justify-between py-4'>
          {summaryItems.map((item) => (
            <div key={item.label} className='flex h-14 flex-1 flex-col items-center justify-center gap-1'>
              <span className='caption1-regular text-text-secondary text-center leading-[18px]'>{item.label}</span>
              <span className='h1-extrabold text-text-primary text-center'>{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { OwnerDailySummarySection };
