const memberTicketListContent = {
  title: '이용권 목록',
  emptyImageSrc: '/images/img_empty_ticket_list.svg',
  emptyTitle: '아직 사용중인 이용권이 없어요',
  emptyDescription: '이용권을 충전하면 등원 예약이 가능해요.',
  emptyFilter: (status: string) => `${status} 이용권이 없어요`,
} as const;

export { memberTicketListContent };
