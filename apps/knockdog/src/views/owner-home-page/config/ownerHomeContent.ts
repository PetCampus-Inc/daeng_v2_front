const ownerHomeContent = {
  emptyStudents: {
    title: '연결된 원생이 없어요',
    description: '보호자를 초대하고 유치원을 운영해 보세요.',
  },
  stats: {
    enrolledLabel: '재원 중',
    arrivalLabel: '오늘 등원',
    departureLabel: '오늘 하원',
  },
  noticebook: {
    pendingPrefix: '발송 전 알림장',
    pendingSuffix: '이 있어요',
    shortcutLabel: '바로가기',
    allSentPrefix: '오늘',
    allSentSuffix: '의 알림장을 모두 발송했어요',
  },
  loadError: '정보를 불러오지 못했어요',
  ownerNameSuffix: ' 원장님',
  quickMenu: {
    connection: {
      label: '연결 관리',
      iconSrc: '/images/ico_owner_home_connection.png',
      ariaLabel: '연결 관리',
    },
    album: {
      label: '앨범 등록',
      iconSrc: '/images/ico_owner_home_album.png',
      ariaLabel: '앨범 등록',
    },
    news: {
      label: '유치원 소식',
      iconSrc: '/images/ico_owner_home_news.png',
      ariaLabel: '유치원 소식',
    },
    invite: {
      label: '보호자 초대',
      iconSrc: '/images/ico_owner_home_invite.png',
      ariaLabel: '보호자 초대',
    },
  },
  operationGuide: {
    title: '똑독 원장님을 위한 운영 가이드',
    description: '유치원 관리 주요 기능과 운영 방법을 알려 드려요.',
    confirmLabel: '확인했어요',
  },
} as const;

export { ownerHomeContent };
