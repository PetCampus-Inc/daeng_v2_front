const ownerKindergartenNewsContent = {
  pageTitle: '유치원 소식',
  createButtonLabel: '소식 올리기',
  searchAriaLabel: '소식 검색',
  empty: {
    imageSrc: '/images/image_owner_kindergarten_news_none.png',
    imageAlt: '올린 소식 없음',
    title: '아직 올린 소식이 없어요',
    description: '소식을 올려 보호자에게 알려 보세요.',
  },
  list: {
    announcementIconSrc: '/images/ico_notice.svg',
    readLabel: '읽음',
    moreAriaLabel: '더보기',
    unreadAriaLabel: '읽지 않음',
  },
} as const;

export { ownerKindergartenNewsContent };
