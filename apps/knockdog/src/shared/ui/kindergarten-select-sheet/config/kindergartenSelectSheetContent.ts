const kindergartenSelectSheetContent = {
  title: '유치원을 선택해 주세요',
  writeTitle: '리뷰를 작성할 유치원을 선택해 주세요',
  writeActionLabel: '리뷰 작성',
  attendingStatusLabel: '지금 다니고 있어요',
  pastStatusLabel: (attendedUntil: string) => `${attendedUntil}까지 다녔어요`,
  toastAccentLabel: '유치원',
  toastSuffix: '을 전환했어요',
} as const;

export { kindergartenSelectSheetContent };
