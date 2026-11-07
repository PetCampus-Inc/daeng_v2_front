'use client';

import { TrashV4 } from '@knockdog/icons';
import { Divider, ExpirationDateRow, TicketLifecycleBadge } from '@knockdog/ui';

import { memberTicketDetailContent } from '@views/owner/member-ticket-detail/config/memberTicketDetailContent';
import { findTicketDetail, type TicketHistoryLine } from '@views/owner/member-ticket-detail/model/memberTicketDetail';

import { Header } from '@widgets/Header';

function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex w-full items-center justify-between py-x4'>
      <p className='body2-regular text-text-secondary'>{label}</p>
      <p className='body1-medium text-text-primary'>{value}</p>
    </div>
  );
}

function HistoryLine({ line }: { line: TicketHistoryLine }) {
  return (
    <div className='flex w-full flex-col gap-0.5 py-[14px]'>
      <p className={`body1-bold text-text-secondary ${line.isCancelled ? 'line-through' : ''}`}>{line.title}</p>
      <p className='body2-regular text-fill-secondary-500'>{line.detail}</p>
    </div>
  );
}

function MemberTicketDetailPage() {
  const content = memberTicketDetailContent;
  const detail = findTicketDetail();
  const endLabel = detail.endsOn ?? content.noExpiry;
  const isActive = detail.status === 'active';

  return (
    <div className='bg-bg-100 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{detail.name}</Header.Title>
        <Header.RightSection>
          <button type='button' aria-label={content.deleteLabel} className='text-text-accent'>
            <TrashV4 />
          </button>
        </Header.RightSection>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto'>
        <section className='bg-bg-0 flex flex-col gap-4 px-4 py-5'>
          <div className='px-1'>
            <TicketLifecycleBadge status={detail.status} />
          </div>
          <div className='flex flex-col gap-2 px-1'>
            <p>
              <span className={`h2-extrabold ${isActive ? 'text-text-accent' : 'text-text-secondary'}`}>
                {content.remaining(detail.remainingCount)}
              </span>
              <span className='body1-medium text-text-secondary'>{content.total(detail.totalCount)}</span>
            </p>
            <p className='label-medium text-text-secondary'>
              {content.period(detail.startsOn, endLabel, detail.remainingDays)}
            </p>
          </div>
          <div className='bg-line-100 h-px w-full' />
          <div className='flex flex-col px-2'>
            <DetailFact label={content.chargeCount} value={`${detail.totalCount}회`} />
            <div className='bg-line-100 h-px w-full' />
            <DetailFact label={content.startDate} value={detail.startsOn} />
            <div className='bg-line-100 h-px w-full' />
            <DetailFact label={content.chargedOn} value={detail.chargedOn} />
            <div className='bg-line-100 h-px w-full' />
            {detail.endsOn ? (
              <ExpirationDateRow date={detail.endsOn} />
            ) : (
              <DetailFact label={content.expiresOn} value={content.noExpiry} />
            )}
          </div>
        </section>

        <section className='bg-bg-0 flex flex-col gap-5 px-4 py-5'>
          <div className='flex flex-col gap-3 px-1'>
            <h2 className='h3-extrabold text-text-primary'>{content.manageTitle}</h2>
            <p className='body2-regular text-text-secondary'>{content.manageDescription}</p>
          </div>
          <button
            type='button'
            className='body1-bold text-fill-secondary-500 border-line-200 bg-bg-0 radius-r3 flex w-full items-center justify-center border border-solid p-x4'
          >
            {content.hold}
          </button>
        </section>

        <section className='bg-bg-0 flex flex-col gap-3 px-4 py-5'>
          <h2 className='h3-extrabold text-text-primary px-1'>{content.historyTitle}</h2>
          <div className='px-2'>
            {detail.history.map((line, index) => (
              <div key={line.id}>
                {index === 0 ? <Divider /> : null}
                <HistoryLine line={line} />
                {index < detail.history.length - 1 ? <Divider /> : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export { MemberTicketDetailPage };
