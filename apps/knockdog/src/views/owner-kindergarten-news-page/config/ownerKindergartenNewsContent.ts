const ownerKindergartenNewsContent = {
  pageTitle: '유치원 소식',
  writeButtonLabel: '소식 올리기',
  searchAriaLabel: '소식 검색',
  editPageTitle: '소식 수정',
  writePageTitle: '소식 등록',
  write: {
    draftSaveLabel: '임시저장',
    submitLabel: '등록',
    titlePlaceholder: '제목을 입력하세요.',
    bodyPlaceholder: '연결된 보호자들에게 전달할 소식을 작성해 주세요.',
    titleMaxLength: 30,
    titleMaxLengthGuide: '소식 제목은 최대 30자까지 입력할 수 있어요.',
    photoLabel: '사진',
    settingsLabel: '공지 및 알림 설정',
    settingsIconSrc: '/images/ico_owner_kindergarten_news_setting.svg',
    settingsAriaLabel: '공지 및 알림 설정',
    bannerText: '공지 등록 시 보호자에게 알림이 발송돼요',
    bannerSettingsLabel: '설정',
    unsavedExitTitle: '저장하지 않고 나갈까요?',
    unsavedExitDescription: '변경한 내용이 저장되지 않아요.',
    unsavedExitCancelLabel: '닫기',
    unsavedExitConfirmLabel: '나가기',
    submitSuccessToast: {
      nativeTitle: '새로운 소식을 등록했어요',
    },
    submitFailedTitle: '소식을 등록하지 못했어요',
    submitFailedDescription: '잠시 후 다시 시도해 주세요.',
    submitFailedCloseLabel: '닫기',
    submitFailedRetryLabel: '다시 시도',
    draftSaveToast: {
      nativeTitle: '작성 중인 소식을 임시저장했어요',
    },
    settingsSheetTitle: '글쓰기 설정',
    settingsSheetCloseLabel: '닫기',
    settingsSheetPlaceholder: '글쓰기 설정은 준비 중이에요.',
  },
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
    imageAriaLabel: '소식 사진 {index}/{total} 보기',
    imageViewerAriaLabel: '소식 사진 보기',
  },
  readReactionSheet: {
    title: '소식을 읽었어요',
    closeAriaLabel: '닫기',
    summaryMiddle: '명 중',
    summarySuffix: '명 읽음',
    unreadOnlyLabel: '안 읽은 보호자만',
    notifyButtonLabel: '알림 전송',
    notifySuccessToast: {
      nativeTitle: '{name} 보호자에게 알림을 전송했어요',
    },
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

export { ownerKindergartenNewsContent };
