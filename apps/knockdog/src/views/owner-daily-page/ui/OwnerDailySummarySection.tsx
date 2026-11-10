import { Fragment, type ComponentProps } from 'react';

import type { OwnerDailySummaryView } from '@views/owner-daily-page/lib/ownerDailySummary';
import { OwnerDailyDateNav } from '@views/owner-daily-page/ui/OwnerDailyDateNav';

interface OwnerDailySummarySectionProps {
  dateNav: ComponentProps<typeof OwnerDailyDateNav>;
  /** 조회 중이거나 실패하면 null. 이때는 날짜 줄만 보인다. */
  summaryView: OwnerDailySummaryView | null;
}

const OwnerDailySummarySection = ({ dateNav, summaryView }: OwnerDailySummarySectionProps) => {
  return (
    <section className='bg-bg-0 flex w-full flex-col'>
      <div className='px-x6 py-x5 flex w-full'>
        <OwnerDailyDateNav {...dateNav} />
      </div>
      {summaryView ? (
        <div className='pt-x1 px-x4 pb-x5 gap-x4 flex w-full flex-col'>
          <section aria-label='등원 현황' className='bg-fill-primary-50 radius-r5 px-x5 py-x4'>
            <p className='h3-semibold text-text-primary'>{summaryView.bannerText}</p>
          </section>
          {summaryView.stats.length > 0 ? (
            <div className='bg-bg-50 radius-r3 px-x4 py-x0_5 flex w-full'>
              <div className='py-x3 flex w-full items-center justify-between'>
                {summaryView.stats.map((stat, index) => (
                  <Fragment key={stat.label}>
                    {index > 0 ? <span aria-hidden className='bg-line-100 h-x10 w-px shrink-0' /> : null}
                    <div
                      role='group'
                      aria-label={stat.label}
                      className='flex w-[100px] shrink-0 flex-col items-center justify-center'
                    >
                      <span className='h1-extrabold text-text-primary text-center'>{stat.count}</span>
                      <span className='body2-regular text-fill-secondary-500 text-center'>{stat.label}</span>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export { OwnerDailySummarySection };
