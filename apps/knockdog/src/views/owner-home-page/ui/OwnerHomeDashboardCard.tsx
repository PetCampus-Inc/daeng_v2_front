'use client';

import { Icon } from '@knockdog/ui';

import { ownerHomeContent } from '@views/owner-home-page/config/ownerHomeContent';

interface OwnerHomeDashboardCardProps {
  dateLabel: string;
  dayLabel: string;
  ownerDisplayName: string;
  isError?: boolean;
  hasConnectedMembers: boolean;
  enrolledCount: number;
  arrivalCount: number;
  departureCount: number;
  noticebookPendingCount: number;
  noticebookSentCount: number;
  shouldShowNoticebook: boolean;
  onNoticebookClick: () => void;
}

function OwnerHomeDashboardCard({
  dateLabel,
  dayLabel,
  ownerDisplayName,
  isError = false,
  hasConnectedMembers,
  enrolledCount,
  arrivalCount,
  departureCount,
  noticebookPendingCount,
  noticebookSentCount,
  shouldShowNoticebook,
  onNoticebookClick,
}: OwnerHomeDashboardCardProps) {
  const { emptyStudents, stats, noticebook, loadError, ownerNameSuffix } = ownerHomeContent;

  return (
    <div className='w-full overflow-hidden rounded-xl'>
      <div className='bg-fill-primary-500 flex items-center justify-between px-4 py-3'>
        <div className='body1-extrabold text-text-primary-inverse flex items-center gap-0.5 whitespace-nowrap'>
          <span>{dateLabel}</span>
          <span>{dayLabel}</span>
        </div>
        <p className='label-semibold text-text-primary-inverse max-w-[50%] truncate'>
          {ownerDisplayName}
          {ownerNameSuffix}
        </p>
      </div>

      <div className='bg-bg-0 flex flex-col items-start px-4'>
        {isError ? (
          <div className='flex w-full items-center justify-center py-10'>
            <span className='body2-regular text-text-secondary'>{loadError}</span>
          </div>
        ) : !hasConnectedMembers ? (
          <div className='flex w-full flex-col items-start py-5'>
            <p className='body2-semibold text-text-primary w-full text-center'>
              {emptyStudents.title}
              <br />
              {emptyStudents.description}
            </p>
          </div>
        ) : (
          <>
            <div className='flex w-full items-end justify-between px-2 py-4'>
              <div className='flex flex-col gap-2'>
                <span className='body2-semibold text-text-primary'>{stats.enrolledLabel}</span>
                <span className='text-text-primary text-[40px] leading-none font-extrabold tracking-tight'>
                  {enrolledCount}
                </span>
              </div>
              <div className='flex items-start gap-5'>
                <div className='flex flex-col items-end gap-2'>
                  <span className='caption1-semibold text-text-secondary'>{stats.arrivalLabel}</span>
                  <span className='text-text-primary text-[24px] leading-none font-extrabold tracking-tight'>
                    {arrivalCount}
                  </span>
                </div>
                <div className='flex flex-col items-end gap-2'>
                  <span className='caption1-semibold text-text-secondary'>{stats.departureLabel}</span>
                  <span className='text-text-primary text-[24px] leading-none font-extrabold tracking-tight'>
                    {departureCount}
                  </span>
                </div>
              </div>
            </div>

            {shouldShowNoticebook ? (
              noticebookPendingCount > 0 ? (
                <button
                  type='button'
                  className='border-line-200 flex w-full items-center justify-between overflow-hidden border-t py-4 text-left'
                  aria-label={noticebook.shortcutLabel}
                  onClick={onNoticebookClick}
                >
                  <div className='flex min-w-0 flex-1 items-center gap-2'>
                    <span className='bg-fill-primary-50 flex size-8 shrink-0 items-center justify-center rounded-full p-2'>
                      <Icon icon='Checklist' className='text-fill-primary-500 size-4' />
                    </span>
                    <div className='body2-semibold text-text-primary flex items-center gap-1 whitespace-nowrap'>
                      <span>{noticebook.pendingPrefix}</span>
                      <span className='flex items-start'>
                        <span className='body2-extrabold text-text-accent'>{noticebookPendingCount}건</span>
                        <span>{noticebook.pendingSuffix}</span>
                      </span>
                    </div>
                  </div>
                  <span className='text-text-accent label-semibold flex shrink-0 items-center gap-1 px-2 py-1'>
                    {noticebook.shortcutLabel}
                    <Icon icon='ChevronRight' className='size-4' />
                  </span>
                </button>
              ) : (
                <div className='border-line-200 flex w-full items-center gap-2 border-t py-4'>
                  <Icon icon='Checklist' className='text-fill-secondary-400 size-4 shrink-0' />
                  <div className='body2-semibold text-text-secondary flex items-center gap-1 whitespace-nowrap'>
                    <span>{noticebook.allSentPrefix}</span>
                    <span className='body2-extrabold text-text-primary'>{noticebookSentCount}건</span>
                    <span>{noticebook.allSentSuffix}</span>
                  </div>
                </div>
              )
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export { OwnerHomeDashboardCard };
export type { OwnerHomeDashboardCardProps };
