import type { OwnerDailySummaryItem } from '@views/owner-daily-page/config/ownerDailyContent';
import { OwnerDailyDateNav } from '@views/owner-daily-page/ui/OwnerDailyDateNav';

interface OwnerDailySummarySectionProps {
  dateLabel: string;
  summaryItems: OwnerDailySummaryItem[];
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenDatePicker: () => void;
  onGoToday: () => void;
  onSummaryItemClick: (index: number) => void;
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
  onSummaryItemClick,
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
          {summaryItems.map((item, index) => (
            <button
              key={item.label}
              type='button'
              aria-label={`${item.label} ${item.count}마리 보기`}
              className='flex h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1'
              onClick={() => onSummaryItemClick(index)}
            >
              <span className='caption1-regular text-text-secondary text-center leading-[18px]'>{item.label}</span>
              <span
                className={`h1-extrabold text-center ${
                  isToday && item.label === '오늘 등원' ? 'text-text-accent' : 'text-text-primary'
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export { OwnerDailySummarySection };
