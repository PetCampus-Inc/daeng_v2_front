import { type ComponentProps } from 'react';

import type { OwnerDailySummaryView } from '@views/owner-daily-page/lib/ownerDailySummary';
import { OwnerDailyDateNav } from '@views/owner-daily-page/ui/OwnerDailyDateNav';

interface OwnerDailySummarySectionProps {
  dateNav: ComponentProps<typeof OwnerDailyDateNav>;
  /** 조회 중이거나 실패하면 null. 이때는 날짜 줄만 보인다. */
  summaryView: OwnerDailySummaryView | null;
}

const OwnerDailySummarySection = ({ dateNav, summaryView }: OwnerDailySummarySectionProps) => {
  return (
    <section className='bg-bg-0 flex w-full flex-col gap-4 pt-4 pb-4'>
      <div className='flex h-[26px] w-full gap-4 px-4'>
        <OwnerDailyDateNav {...dateNav} />
      </div>
      {summaryView ? (
        <div className='flex w-full flex-col gap-3 px-4'>
          <section aria-label='등원 현황' className='bg-bg-50 radius-r3 px-4 py-3'>
            <p className='body1-bold text-text-primary'>{summaryView.bannerText}</p>
          </section>
          {summaryView.stats.length > 0 ? (
            <div className='bg-bg-50 radius-r3 flex w-full justify-between py-4'>
              {summaryView.stats.map((stat) => (
                <div
                  key={stat.label}
                  role='group'
                  aria-label={stat.label}
                  className='flex h-14 flex-1 flex-col items-center justify-center gap-1'
                >
                  <span className='caption1-regular text-text-secondary text-center leading-[18px]'>{stat.label}</span>
                  <span className='h1-extrabold text-text-primary text-center'>{stat.count}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export { OwnerDailySummarySection };
