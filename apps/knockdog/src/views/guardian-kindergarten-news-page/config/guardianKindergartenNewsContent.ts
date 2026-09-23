const guardianKindergartenNewsContent = {
  pageTitleFallback: '유치원 소식',
  pageTitleSuffix: ' 소식',
  sectionTitle: '유치원 새소식',
  viewAllLabel: '전체 보기',
  searchAriaLabel: '소식 검색',
  newBadgeAriaLabel: '새소식',
  announcementIconSrc: '/images/ico_notice.svg',
  overflowLabel: (remaining: number) => `+ ${remaining}`,
  emptyTitle: '아직 등록된 소식이 없어요',
  emptyDescription: '유치원에서 소식이 등록되면 이곳에서 볼 수 있어요.',
  disconnectedTitle: '유치원 소식을 확인할 수 없어요',
  disconnectedDescription: '유치원 연결이 해제되어 유치원 소식을 확인할 수 없어요.',
  empty: {
    imageSrc: '/images/image_guardian_kindergarten_news_none.png',
    imageAlt: '등록된 소식 없음',
    title: '아직 등록된 소식이 없어요',
    description: '유치원에서 소식이 등록되면\n이곳에서 볼 수 있어요.',
  },
} as const;

export { guardianKindergartenNewsContent };
