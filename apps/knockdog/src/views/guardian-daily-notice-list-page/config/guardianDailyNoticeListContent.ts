const guardianDailyNoticeListContent = {
  listAriaLabel: '알림장 리스트',
  kindergartenSelectAriaLabel: '유치원 선택',
  monthNav: {
    prevAriaLabel: '이전 달',
    nextAriaLabel: '다음 달',
    yearMonthAriaLabel: '연월 선택',
    noMoreNoticeToastPrefix: '더 이상 볼 수 있는 ',
    noMoreNoticeToastAccent: '알림장',
    noMoreNoticeToastSuffix: '이 없어요',
    maxMonthToast: '여기까지 볼 수 있어요',
  },
  monthEmpty: {
    imageSrc: '/images/image_guardian_notice_none.png',
    imageAlt: '알림장 없음',
    title: '이 달에는 알림장이 없어요',
    description: '달력에서 다른 날짜를 확인해 보세요.',
  },
  card: {
    checkInLabel: '등원',
    checkOutLabel: '하원',
    timeSeparator: '-',
    emptyNoticeMessage: '작성된 알림장이 없어요',
    conditionBadgeLabel: '컨디션',
    stoolBadgeLabel: '배변',
    detailAriaLabel: (dateLabel: string) => `${dateLabel} 알림장 보기`,
  },
  firstAttendance: {
    message: '유치원을 다니기 시작했어요',
  },
  attendedUntil: {
    message: '여기까지 다녔어요',
  },
} as const;

export { guardianDailyNoticeListContent };
