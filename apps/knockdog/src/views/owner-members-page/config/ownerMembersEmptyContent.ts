type OwnerMembersEmptyStateType = 'emptyStudents' | 'emptySearchResult';

interface OwnerMembersEmptyContent {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
}

const ownerMembersEmptyContent = {
  emptyStudents: {
    imageSrc: '/images/img_empty_students.png',
    imageAlt: '연결된 원생 없음',
    title: '연결된 원생이 없어요',
    description: '보호자를 초대하고 유치원을 운영해 보세요.',
  },
  emptySearchResult: {
    imageSrc: '/images/img_empty_result2.png',
    imageAlt: '검색 결과 없음',
    title: '검색 결과가 없어요',
    description: '검색어를 다시 확인해 주세요.',
  },
} satisfies Record<OwnerMembersEmptyStateType, OwnerMembersEmptyContent>;

export { ownerMembersEmptyContent, type OwnerMembersEmptyContent, type OwnerMembersEmptyStateType };
