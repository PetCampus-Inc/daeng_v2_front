const memberTicketListContent = {
  title: '이용권 목록',
  emptyTitle: '아직 사용중인 이용권이 없어요',
  emptyDescription: '이용권을 충전하면 등원 예약이 가능해요.',
  emptyFilter: (status: string) => `${status} 이용권이 없어요`,
} as const;

export { memberTicketListContent };
