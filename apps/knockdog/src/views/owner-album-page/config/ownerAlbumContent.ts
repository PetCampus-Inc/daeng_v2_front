const ownerAlbumContent = {
  pageTitle: '앨범',
  infoAriaLabel: '앨범 안내',
  empty: {
    imageSrc: '/images/img_empty_album.png',
    imageAlt: '올린 사진 없음',
    title: '아직 올린 사진이 없어요',
    description: '사진을 올려 보호자에게 보여주세요',
  },
  uploadButtonLabel: '사진 올리기',
  infoSheet: {
    title: '사진 업로드 유의사항',
    confirmLabel: '확인',
    notices: [
      '개인정보가 노출되지 않은 사진만 올릴 수 있어요.',
      '올린 사진은 유치원에 연결된 모든 원생에게 공유돼요.',
      '20MB 이하의 JPG, JPEG, PNG, HEIC, HEIF 사진을 올릴 수 있어요.',
      '사진은 한 번에 최대 50장까지 선택할 수 있어요.',
    ],
  },
} as const;

export { ownerAlbumContent };
