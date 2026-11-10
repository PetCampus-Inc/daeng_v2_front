type OwnerMembersEmptyStateType = 'emptyStudents' | 'emptySearchResult' | 'emptyExpiring' | 'emptyExpired';

interface OwnerMembersEmptyContent {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
}

const FILTER_EMPTY_DESCRIPTION = '다른 상태의 원생을 확인해 보세요.';

const ownerMembersEmptyContent = {
  emptyStudents: {
    imageSrc: '/images/img_empty_students.png',
    imageAlt: '등록된 원생 없음',
    title: '등록된 원생이 없어요',
    description: '보호자를 연결하고 유치원을 운영해 보세요.',
  },
  emptySearchResult: {
    imageSrc: '/images/img_empty_result2.png',
    imageAlt: '검색 결과 없음',
    title: '검색된 원생이 없어요',
    description: '다른 원생을 검색해보세요.',
  },
  emptyExpiring: {
    imageSrc: '/images/img_empty_result2.png',
    imageAlt: '만료 예정인 원생 없음',
    title: '만료 예정인 원생이 없어요',
    description: FILTER_EMPTY_DESCRIPTION,
  },
  emptyExpired: {
    imageSrc: '/images/img_empty_result2.png',
    imageAlt: '이용권이 만료된 원생 없음',
    title: '이용권이 만료된 원생이 없어요',
    description: FILTER_EMPTY_DESCRIPTION,
  },
} satisfies Record<OwnerMembersEmptyStateType, OwnerMembersEmptyContent>;

export { ownerMembersEmptyContent, type OwnerMembersEmptyContent, type OwnerMembersEmptyStateType };
