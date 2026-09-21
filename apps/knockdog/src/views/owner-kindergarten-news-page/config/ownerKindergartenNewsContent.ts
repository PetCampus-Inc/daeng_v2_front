const ownerKindergartenNewsContent = {
  pageTitle: '유치원 소식',
  createButtonLabel: '소식 올리기',
  searchAriaLabel: '소식 검색',
  editPageTitle: '소식 수정',
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
    /** 업로드 후 KST 3일간 유지 */
    newBadgeAriaLabel: '새 소식',
    editLabel: '수정하기',
    deleteLabel: '삭제하기',
  },
  deleteDialog: {
    title: '소식을 삭제할까요?',
    cancelLabel: '닫기',
    confirmLabel: '삭제하기',
  },
  deleteSuccessToast: {
    nativeTitle: '유치원 소식을 삭제했어요',
  },
  detail: {
    shareAriaLabel: '공유',
    sendNotificationLabel: '알림 발송',
    readStatusPrefix: '보호자',
    readStatusMiddle: '명 중',
    readStatusSuffix: '명이 읽었어요',
    notFound: '소식을 찾을 수 없어요',
  },
  shareSuccessToast: {
    nativeTitle: '유치원 소식을 공유했어요',
  },
} as const;

export { ownerKindergartenNewsContent };
