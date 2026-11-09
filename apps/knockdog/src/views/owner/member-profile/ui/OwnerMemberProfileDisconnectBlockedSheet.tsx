'use client';

import { ActionButton } from '@knockdog/ui';

import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';

import type {
  OwnerMemberDisconnectBlock,
  OwnerMemberDisconnectBodyKind,
} from '@entities/owner-member';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface OwnerMemberProfileDisconnectBlockedSheetProps {
  isOpen: boolean;
  close: () => void;
  /** 이용권이 하나라도 있으면 이용권 본문, 예약만 있으면 예약 본문 */
  bodyKind: OwnerMemberDisconnectBodyKind;
  /** 서버 순서 그대로(예약 먼저, 이용권 뒤) */
  blocks: OwnerMemberDisconnectBlock[];
  kindergartenName: string;
}

interface DisconnectBlockRowProps {
  title: string;
  description: string;
  trailing: string;
}

const DisconnectBlockRow = ({ title, description, trailing }: DisconnectBlockRowProps) => (
  <li className='radius-r3 bg-bg-0 border-line-200 py-x4 px-x4 flex items-center justify-between border border-solid'>
    <span className='gap-x1 flex min-w-0 flex-col'>
      <span className='body1-medium text-text-primary'>{title}</span>
      <span className='caption1-regular text-fill-secondary-500'>{description}</span>
    </span>
    <span className='body1-medium text-text-accent shrink-0'>{trailing}</span>
  </li>
);

const OwnerMemberProfileDisconnectBlockedSheet = ({
  isOpen,
  close,
  bodyKind,
  blocks,
  kindergartenName,
}: OwnerMemberProfileDisconnectBlockedSheetProps) => {
  const { disconnectBlockedSheet } = ownerMemberProfileContent;
  const body =
    bodyKind === 'ticket' ? disconnectBlockedSheet.ticketBody : disconnectBlockedSheet.reservationBody;

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Title className='h2-extrabold text-text-primary px-x4 pt-x4'>
          {disconnectBlockedSheet.title}
        </BottomSheet.Title>
        <div className='px-x4 gap-x4 py-x4 flex flex-col'>
          <p className='body1-regular text-text-secondary whitespace-pre-line'>{body}</p>
          <ul className='gap-x2 flex max-h-[240px] flex-col overflow-y-auto'>
            {blocks.map((block, index) =>
              block.type === 'reservation' ? (
                <DisconnectBlockRow
                  key={`reservation-${index}`}
                  title={`${kindergartenName}${disconnectBlockedSheet.reservationTitleSuffix}`}
                  description={`${block.dateLabel} ${block.timeLabel}${disconnectBlockedSheet.reservationDescriptionSuffix}`}
                  trailing={disconnectBlockedSheet.reservationStatusLabel}
                />
              ) : (
                <DisconnectBlockRow
                  key={`ticket-${index}`}
                  title={block.name}
                  description={block.expiryLabel}
                  trailing={`${block.remainingCount}${disconnectBlockedSheet.remainingCountSuffix}`}
                />
              )
            )}
          </ul>
        </div>
        <div className='px-x4 pb-x4'>
          <ActionButton type='button' onClick={close}>
            {disconnectBlockedSheet.confirmLabel}
          </ActionButton>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
};

export { OwnerMemberProfileDisconnectBlockedSheet };
