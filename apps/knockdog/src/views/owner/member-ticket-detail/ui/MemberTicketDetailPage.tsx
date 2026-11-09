'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { TrashV4 } from '@knockdog/icons';
import { Divider, ExpirationDateRow, TicketLifecycleBadge } from '@knockdog/ui';

import { memberTicketDetailContent } from '@views/owner/member-ticket-detail/config/memberTicketDetailContent';
import { toTicketDetail } from '@views/owner/member-ticket-detail/model/memberTicketDetail';
import { toExpiryApiDate } from '@views/owner/member-ticket-detail/model/memberTicketExpiry';

import { TicketConfirmDialog } from '@views/owner/member-ticket-detail/ui/TicketConfirmDialog';
import { TicketExpirySheet } from '@views/owner/member-ticket-detail/ui/TicketExpirySheet';
import { TicketHoldSheet } from '@views/owner/member-ticket-detail/ui/TicketHoldSheet';

import { Header } from '@widgets/Header';

import {
  useCancelPetTicketHoldMutation,
  useDeletePetTicketMutation,
  usePetTicketDetailQuery,
  usePetTicketExpiryMutation,
  usePetTicketHistoryQuery,
  usePetTicketHoldMutation,
  type PetTicketHistoryLine,
} from '@entities/owner-pet-ticket';

import { useStackNavigation } from '@shared/lib/bridge';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { toast } from '@shared/ui/toast';

function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex w-full items-center justify-between py-x4'>
      <p className='body2-regular text-text-secondary'>{label}</p>
      <p className='body1-medium text-text-primary'>{value}</p>
    </div>
  );
}

function HistoryLine({ line }: { line: PetTicketHistoryLine }) {
  return (
    <div className='flex w-full flex-col gap-0.5 py-[14px]'>
      <p className={`body1-bold text-text-secondary ${line.isCancelled ? 'line-through' : ''}`}>{line.title}</p>
      <p className='body2-regular text-fill-secondary-500'>{line.detail}</p>
    </div>
  );
}

function MemberTicketDetailPage() {
  const content = memberTicketDetailContent;
  const params = useParams<{ id: string; ticketId: string }>();
  const petId = params?.id ?? '';
  const ticketId = params?.ticketId ?? '';
  const { data, isLoading, isError } = usePetTicketDetailQuery(petId, ticketId);
  const { data: history = [], isLoading: isHistoryLoading, isError: isHistoryError } = usePetTicketHistoryQuery(petId, ticketId);
  const deleteTicket = useDeletePetTicketMutation(petId, ticketId);
  const updateExpiry = usePetTicketExpiryMutation(petId, ticketId);
  const holdTicket = usePetTicketHoldMutation(petId, ticketId);
  const cancelHold = useCancelPetTicketHoldMutation(petId, ticketId);
  const { back } = useStackNavigation();
  const detail = data ? toTicketDetail(data) : null;
  const [isHoldOpen, setIsHoldOpen] = useState(false);
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const isHoldSet = detail?.hold != null;
  const isHoldPending = holdTicket.isPending || cancelHold.isPending;
  const isHoldDisabled = isHoldPending || (!isHoldSet && detail?.holdAction === 'disabled');
  const endLabel = detail?.endsOn ?? content.noExpiry;
  const isRemainingAccent = detail?.status === 'active' || detail?.status === 'onHold';

  const showToast = (title: string, type: 'success' | 'default') => {
    toast({
      type,
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: title,
      title,
    });
  };

  const handleConfirmHold = (startsOn: string, endsOn: string) => {
    const startDate = toExpiryApiDate(startsOn);
    const endDate = toExpiryApiDate(endsOn);
    if (!startDate || !endDate || !petId || !ticketId || holdTicket.isPending) return;

    holdTicket.mutate(
      { startDate, endDate },
      {
        onError: () => {
          showToast(content.holdFailure, 'default');
        },
      }
    );
  };

  const handleConfirmCancel = () => {
    if (!petId || !ticketId || cancelHold.isPending) return;

    cancelHold.mutate(undefined, {
      onSuccess: () => {
        setIsCancelOpen(false);
        showToast(content.cancelHoldSuccess, 'success');
      },
      onError: () => {
        showToast(content.cancelHoldFailure, 'default');
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!petId || !ticketId || deleteTicket.isPending) return;

    deleteTicket.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        showToast(content.deleteSuccess, 'success');
        back().catch(() => undefined);
      },
      onError: () => {
        showToast(content.deleteFailure, 'default');
      },
    });
  };

  const handleConfirmExpiry = (endsOn: string) => {
    const expiresOn = toExpiryApiDate(endsOn);
    if (!expiresOn || !petId || !ticketId || updateExpiry.isPending) return;

    updateExpiry.mutate(expiresOn, {
      onError: () => {
        showToast(content.expiryFailure, 'default');
      },
    });
  };

  return (
    <div className='bg-bg-100 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{detail?.name ?? ''}</Header.Title>
        <Header.RightSection>
          <button type='button' aria-label={content.deleteLabel} className='text-text-accent' onClick={() => setIsDeleteOpen(true)}>
            <TrashV4 />
          </button>
        </Header.RightSection>
      </Header>

      {isLoading || !detail ? (
        isError ? (
          <p className='body2-regular text-text-secondary py-10 text-center'>{content.loadErrorText}</p>
        ) : (
          <DelayedLoadingSpinner isLoading layout='content' className='py-10' />
        )
      ) : (
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
            disabled={isHoldDisabled}
            className={`body1-bold border-line-200 bg-bg-0 radius-r3 flex w-full items-center justify-center border border-solid p-x4 ${isHoldSet || isHoldDisabled ? 'text-text-tertiary' : 'text-fill-secondary-500'}`}
            onClick={() => (isHoldSet ? setIsCancelOpen(true) : setIsHoldOpen(true))}
          >
            {isHoldSet ? content.cancelHold : content.hold}
          </button>
        </section>

        {isHistoryLoading || isHistoryError || history.length > 0 ? (
          <section className='bg-bg-0 flex flex-col gap-3 px-4 py-5'>
            <h2 className='h3-extrabold text-text-primary px-1'>{content.historyTitle}</h2>
            {isHistoryLoading ? (
              <DelayedLoadingSpinner isLoading layout='content' className='py-6' />
            ) : isHistoryError ? (
              <p className='body2-regular text-text-secondary px-1'>{content.historyErrorText}</p>
            ) : (
              <div className='px-2'>
                {history.map((line, index) => (
                  <div key={line.id}>
                    {index === 0 ? <Divider /> : null}
                    <HistoryLine line={line} />
                    {index < history.length - 1 ? <Divider /> : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>
      )}
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
        currentEndsOn={detail?.endsOn ?? null}
        onOpenChange={setIsExpiryOpen}
        onConfirm={handleConfirmExpiry}
      />
    </div>
  );
}

export { MemberTicketDetailPage };
