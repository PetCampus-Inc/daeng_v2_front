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
  empty: {
    imageSrc: '/images/img_empty_album_pre_attend.png',
    imageAlt: '등록된 앨범 없음',
    title: '아직 등록된 앨범이 없어요',
    description: '유치원에서 앨범이 등록되면\n이곳에서 볼 수 있어요.',
  },
} as const;

export { guardianAlbumContent };
