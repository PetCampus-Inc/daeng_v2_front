const guardianDailyNoticeContent = {
  pageTitle: '오늘의 알림장',
  albumListAriaLabel: '앨범 리스트 보기',
  checkInLabel: '등원',
  checkOutLabel: '하원',
  emptyTimeLabel: '--:--',
  updatedAtSuffix: '수정',
  noticeSectionTitle: '알림장',
  snackSectionTitle: '간식',
  stoolSectionTitle: '배변',
  albumViewLabel: '앨범보기',
  albumViewAriaLabel: '앨범 보기',
  albumLoadErrorMessage: '사진을 불러오지 못했어요',
  albumOverflowLabel: (remaining: number) => `+ ${remaining}`,
  emptyNoticeMessage: '이 날은 도착한 알림장이 없어요',
  writingInProgressTitle: '아직 알림장을 작성 중이에요',
  writingInProgressDescription: '작성이 완료되면 알려드릴게요.',
  noticeIconSrc: '/images/ico_note.png',
  snackIconSrc: '/images/ico_snack.png',
  stoolIconSrc: '/images/ico_stool.png',
  springRingSrc: '/images/note_spring_ring.svg',
} as const;

export { guardianDailyNoticeContent };
