const guardianDailyNoticeListContent = {
  listAriaLabel: '알림장 리스트',
  monthNav: {
    prevAriaLabel: '이전 달',
    nextAriaLabel: '다음 달',
    yearMonthAriaLabel: '연월 선택',
  },
  monthEmpty: {
    imageSrc: '/images/image_guardian_notice_none.png',
    imageAlt: '알림장 없음',
    title: '이 달에는 알림장이 없어요',
    description: '달력에서 다른 날짜를 확인해 보세요.',
  },
} as const;

export { guardianDailyNoticeListContent };
