const guardianKindergartenNewsContent = {
  pageTitleFallback: '유치원 소식',
  pageTitleSuffix: ' 소식',
  sectionTitle: '유치원 새소식',
  viewAllLabel: '전체 보기',
  searchAriaLabel: '소식 검색',
  search: {
    placeholder: '제목 또는 내용을 검색하세요',
    emptyRecent: '최근 검색 내역이 없어요.',
    emptyResult: {
      imageSrc: '/images/image_search_none.png',
      imageAlt: '검색 결과 없음',
      title: '검색 결과가 없어요',
      description: '검색어를 다시 확인해 주세요.',
    },
    recentTitle: '최근 검색어',
    clearAllLabel: '전체 삭제',
  },
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
  detail: {
    shareAriaLabel: '공유',
    notFound: '소식을 찾을 수 없어요',
    imageAriaLabel: '소식 사진 {index}/{total} 보기',
    imageViewerAriaLabel: '소식 사진 보기',
  },
  imageViewer: {
    closeAriaLabel: '사진 보기 닫기',
    saveAriaLabel: '사진 저장',
    saveSuccessToast: {
      nativeTitle: '사진을 저장했어요',
    },
    saveFailedToast: {
      nativeTitle: '사진을 저장하지 못했어요',
    },
  },
  shareSuccessToast: {
    nativeTitle: '유치원 소식을 공유했어요',
  },
} as const;

export { guardianKindergartenNewsContent };
