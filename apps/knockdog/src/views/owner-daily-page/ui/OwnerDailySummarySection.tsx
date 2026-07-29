import type { OwnerDailySummaryItem } from '@views/owner-daily-page/config/ownerDailyContent';

interface OwnerDailySummarySectionProps {
  dateLabel: string;
  summaryItems: OwnerDailySummaryItem[];
}

function OwnerDailySummarySection({ dateLabel, summaryItems }: OwnerDailySummarySectionProps) {
  return (
    <section className='bg-bg-0 flex h-[166px] w-full flex-col gap-4 pt-5 pb-4'>
      <div className='flex h-[26px] w-full gap-4 px-4'>
        <p className='h3-extrabold text-text-primary'>{dateLabel}</p>
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
