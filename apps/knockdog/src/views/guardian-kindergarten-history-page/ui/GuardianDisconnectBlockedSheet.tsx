'use client';

import { DisconnectSheet, type DisconnectTicketProps } from '@knockdog/ui';

import { BottomSheet } from '@shared/ui/bottom-sheet';
import { guardianConnectionHistoryContent } from '@views/guardian-kindergarten-history-page/config/guardianConnectionHistoryContent';

interface GuardianDisconnectBlockedSheetProps {
  isOpen: boolean;
  /** 이용권 안내면 이용권 목록, 예약 안내면 예약 1건을 담는다 */
  body: string;
  tickets: DisconnectTicketProps[];
  onInquiry: () => void;
  onConfirm: () => void;
}

/** 이용권·예약이 남아 연결을 해제할 수 없을 때 여는 시트. 확인 버튼으로만 닫힌다. */
const GuardianDisconnectBlockedSheet = ({
  isOpen,
  body,
  tickets,
  onInquiry,
  onConfirm,
}: GuardianDisconnectBlockedSheetProps) => {
  const { blockedSheet } = guardianConnectionHistoryContent;

  return (
    <BottomSheet.Root open={isOpen} dismissible={false}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal overflow-hidden bg-transparent shadow-none'>
        <BottomSheet.Title className='sr-only'>{blockedSheet.title}</BottomSheet.Title>
        <DisconnectSheet
          title={blockedSheet.title}
          body={body}
          tickets={tickets}
          isScrollable={tickets.length >= blockedSheet.scrollableTicketCount}
          onInquiry={onInquiry}
          onConfirm={onConfirm}
        />
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
};

export { GuardianDisconnectBlockedSheet };
