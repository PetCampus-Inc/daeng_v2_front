'use client';

import { useState } from 'react';

import { TrashV4 } from '@knockdog/icons';
import { Divider, ExpirationDateRow, TicketLifecycleBadge } from '@knockdog/ui';

import { memberTicketDetailContent } from '@views/owner/member-ticket-detail/config/memberTicketDetailContent';
import { findTicketDetail, type TicketHistoryLine } from '@views/owner/member-ticket-detail/model/memberTicketDetail';
import { applyExpiryExtension } from '@views/owner/member-ticket-detail/model/memberTicketExpiry';
import { applyTicketHold, cancelTicketHold } from '@views/owner/member-ticket-detail/model/memberTicketHold';

import { TicketConfirmDialog } from '@views/owner/member-ticket-detail/ui/TicketConfirmDialog';
import { TicketExpirySheet } from '@views/owner/member-ticket-detail/ui/TicketExpirySheet';
import { TicketHoldSheet } from '@views/owner/member-ticket-detail/ui/TicketHoldSheet';

import { Header } from '@widgets/Header';

import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

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
  const { back } = useStackNavigation();
  const [detail, setDetail] = useState(findTicketDetail);
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const isHoldSet = detail.hold != null;
  const endLabel = detail.endsOn ?? content.noExpiry;
  const isRemainingAccent = detail.status === 'active' || detail.status === 'onHold';

  const showSuccessToast = (title: string) => {
    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: title,
      title,
    });
  };

  const handleConfirmHold = (startsOn: string, endsOn: string) => {
    setDetail((current) => applyTicketHold(current, startsOn, endsOn, new Date()));
  };

  const handleConfirmCancel = () => {
    setDetail((current) => cancelTicketHold(current, new Date()));
    setIsCancelOpen(false);
    showSuccessToast(content.cancelHoldSuccess);
  };

  const handleConfirmDelete = () => {
    setIsDeleteOpen(false);
    showSuccessToast(content.deleteSuccess);
    back().catch(() => undefined);
  };

  const handleConfirmExpiry = (endsOn: string) => {
    setDetail((current) => applyExpiryExtension(current, endsOn));
  };

  return (
    <div className='bg-bg-100 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{detail.name}</Header.Title>
        <Header.RightSection>
          <button type='button' aria-label={content.deleteLabel} className='text-text-accent' onClick={() => setIsDeleteOpen(true)}>
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
              <span className={`h2-extrabold ${isRemainingAccent ? 'text-text-accent' : 'text-text-secondary'}`}>
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
              <ExpirationDateRow date={detail.endsOn} onClick={() => setIsExpiryOpen(true)} />
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
            className={`body1-bold border-line-200 bg-bg-0 radius-r3 flex w-full items-center justify-center border border-solid p-x4 ${isHoldSet ? 'text-text-tertiary' : 'text-fill-secondary-500'}`}
            onClick={() => (isHoldSet ? setIsCancelOpen(true) : setIsHoldOpen(true))}
          >
            {isHoldSet ? content.cancelHold : content.hold}
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
      <TicketHoldSheet isOpen={isHoldOpen} onOpenChange={setIsHoldOpen} onConfirm={handleConfirmHold} />
      <TicketConfirmDialog
        isOpen={isDeleteOpen}
        title={content.deleteTitle}
        description={content.deleteDescription}
        confirmLabel={content.deleteConfirm}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <TicketConfirmDialog
        isOpen={isCancelOpen}
        title={content.cancelHoldTitle}
        description={content.cancelHoldDescription}
        confirmLabel={content.cancelHoldConfirm}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleConfirmCancel}
      />
      <TicketExpirySheet
        isOpen={isExpiryOpen}
        currentEndsOn={detail.endsOn}
        onOpenChange={setIsExpiryOpen}
        onConfirm={handleConfirmExpiry}
      />
    </div>
  );
}

export { MemberTicketDetailPage };
