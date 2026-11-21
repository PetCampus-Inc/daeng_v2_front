type OwnerMembersEmptyStateType = 'emptyStudents' | 'emptySearchResult' | 'emptyExpiring' | 'emptyExpired';

interface OwnerMembersEmptyContent {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
}

const HOUSE_ILLUSTRATION = '/images/img_members_empty_pending.svg';
const TICKET_ILLUSTRATION = '/images/img_members_empty_ticket.svg';
const FILTER_EMPTY_DESCRIPTION = '다른 상태의 원생을 확인해 보세요.';

const ownerMembersEmptyContent = {
  emptyStudents: {
    imageSrc: HOUSE_ILLUSTRATION,
    imageAlt: '등록된 원생 없음',
    title: '등록된 원생이 없어요',
    description: '보호자를 연결하고 유치원을 운영해 보세요.',
  },
  emptyPending: {
    imageSrc: HOUSE_ILLUSTRATION,
    imageAlt: '신청된 원생 없음',
    title: '신청한 원생이 없어요',
    description: 'QR코드를 통해 원생 신청을 받아보세요.',
  },
  emptySearchResult: {
    imageSrc: HOUSE_ILLUSTRATION,
    imageAlt: '검색 결과 없음',
    title: '검색된 원생이 없어요',
    description: '다른 원생을 검색해보세요.',
  },
  emptyExpiring: {
    imageSrc: TICKET_ILLUSTRATION,
    imageAlt: '이용권이 종료 예정인 원생 없음',
    title: '이용권이 종료 예정인 원생이 없어요',
    description: FILTER_EMPTY_DESCRIPTION,
  },
  emptyExpired: {
    imageSrc: TICKET_ILLUSTRATION,
    imageAlt: '이용권이 종료된 원생 없음',
    title: '이용권이 종료된 원생이 없어요',
    description: FILTER_EMPTY_DESCRIPTION,
  },
} satisfies Record<OwnerMembersEmptyStateType | 'emptyPending', OwnerMembersEmptyContent>;

export { ownerMembersEmptyContent, type OwnerMembersEmptyContent, type OwnerMembersEmptyStateType };
