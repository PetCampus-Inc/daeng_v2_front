const guardianAlbumContent = {
  filterAriaLabel: '앨범 필터',
  infoAriaLabel: '앨범 안내',
  kindergartenSelectAriaLabel: '유치원 선택',
  kindergartenSelectTitle: '유치원을 선택해 주세요',
  attendingStatusLabel: '지금 다니고 있어요',
  pastStatusLabel: (attendedUntil: string) => `${attendedUntil}까지 다녔어요`,
  toastAccentLabel: '유치원',
  toastSuffix: '을 전환했어요',
  infoSheet: {
    title: '앨범 이용 안내',
    notices: [
      '유치원 앨범은 유치원 보호자님들과 함께 보는 공간이에요.',
      '즐겨찾기하면 원하는 사진만 모아 볼 수 있어요.',
    ],
  },
  filterSheet: {
    title: '보기 방식을 선택해 주세요',
    options: [
      { value: 'all', label: '전체 보기' },
      { value: 'favorite', label: '즐겨찾기만 보기' },
      { value: 'attendance', label: '등원일만 보기' },
    ],
  },
  today: {
    titleSuffix: '의 오늘 하루',
    notAttendedTitle: '오늘은 등원하지 않았어요',
    photoCountLabel: (count: number) => `${count}장`,
    photoCountAriaLabel: '오늘 앨범 상세 보기',
    newBadgeLabel: 'NEW',
    bookmarkAriaLabel: '즐겨찾기',
    bookmarkIconDefaultSrc: '/images/ico_photo_like_default.png',
    bookmarkIconActiveSrc: '/images/ico_photo_like_active.png',
    overflowLabel: (remaining: number) => `+ ${remaining}`,
  },
  monthNav: {
    prevAriaLabel: '이전 달',
    nextAriaLabel: '다음 달',
    yearMonthAriaLabel: '연월 선택',
    searchAriaLabel: '날짜 검색',
    searchIconSrc: '/images/ico_album_calendar_search.png',
    noMoreAlbumToast: '더 이상 볼 수 있는 앨범이 없어요',
    attendedUntilToast: '여기까지 볼 수 있어요',
  },
  monthPickerSheet: {
    confirmLabel: '확인',
    yearLabel: (year: number) => `${year}년`,
    monthLabel: (month: number) => `${month}월`,
  },
  dateSelectSheet: {
    title: '날짜를 선택해 주세요',
    todayButtonLabel: '오늘',
    confirmLabel: (date: Date) =>
      `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 선택`,
  },
  dayCard: {
    attendedBadgeLabel: '등원했어요',
    overflowLabel: (remaining: number) => `+ ${remaining}`,
    loadErrorMessage: '사진을 불러오지 못했어요',
  },
  favoriteList: {
    overflowLabel: (remaining: number) => `+ ${remaining}장`,
    endMessage: '더 이상 볼 수 있는 사진이 없어요',
  },
  history: {
    firstAttendanceMessage: '유치원을 다니기 시작했어요',
    attendedUntilMessage: '여기까지 다녔어요',
  },
  monthEmpty: {
    title: '이 달에는 등록된 앨범이 없어요',
    description: '달력에서 다른 날짜를 확인해 보세요.',
  },
  filterEmpty: {
    imageSrc: '/images/img_waiting_kindergarten.png',
    imageAlt: '앨범 필터 결과 없음',
    ctaLabel: '전체 보기로 돌아가기',
    favorite: {
      title: '즐겨찾기한 사진이 없어요',
      description: '모아 보고 싶은 사진을 즐겨찾기 해 보세요.',
    },
    attendance: {
      title: '등원한 날의 사진이 없어요',
      description: '등원 기록이 쌓이면 여기서\n확인할 수 있어요.',
    },
  },
  scrollTopAriaLabel: '맨 위로',
  empty: {
    imageSrc: '/images/img_empty_album_pre_attend.png',
    imageAlt: '등록된 앨범 없음',
    title: '아직 등록된 앨범이 없어요',
    description: '유치원에서 앨범이 등록되면\n이곳에서 볼 수 있어요.',
  },
} as const;

export { guardianAlbumContent };
