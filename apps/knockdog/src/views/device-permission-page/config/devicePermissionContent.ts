const devicePermissionContent = {
  title: '똑독을 사용하기 위해\n아래의 권한 허용이 필요해요',
  confirmLabel: '확인',
  items: [
    {
      icon: 'LocationFill' as const,
      title: '위치',
      description: '주변 강아지 유치원 검색을 위해 필요해요.',
    },
    {
      icon: 'Camera' as const,
      title: '카메라',
      description: '상담 메모, 오류 제보 등 사진 촬영 기능에 필요해요.',
    },
    {
      icon: 'Gallery' as const,
      title: '사진',
      description: '촬영한 사진을 저장하거나 불러올 때 필요해요.',
    },
    {
      icon: 'AlarmFill' as const,
      title: '알림',
      description: '서비스 업데이트 등 알림 제공을 위해 필요해요.',
    },
  ],
};

export { devicePermissionContent };
