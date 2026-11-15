import { Fragment } from 'react';

import type { OwnerDailySummaryView } from '@views/owner-daily-page/lib/ownerDailySummary';

interface OwnerDailySummarySectionProps {
  /** 조회 중이거나 실패하면 null. 이때는 아무것도 보이지 않는다. */
  summaryView: OwnerDailySummaryView | null;
}

/** 등원 현황 배너와 요약 숫자. 날짜 선택줄은 포함하지 않으며, 탭과 함께 스크롤된다. */
const OwnerDailySummarySection = ({ summaryView }: OwnerDailySummarySectionProps) => {
  return (
    <section className='bg-bg-0 flex w-full flex-col'>
      {summaryView ? (
        <div className='pt-x1 px-x4 pb-x5 gap-x4 flex w-full flex-col'>
          <section aria-label='등원 현황' className='bg-fill-primary-50 radius-r5 px-x5 py-x4'>
            <p className='body1-medium text-text-primary'>
              <span className='h3-semibold text-text-accent'>{summaryView.bannerCount}</span>
              {summaryView.bannerTotal != null ? (
                <span className='text-fill-secondary-500'>{` / ${summaryView.bannerTotal}`}</span>
              ) : null}{' '}
              {summaryView.bannerDescription}
            </p>
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
