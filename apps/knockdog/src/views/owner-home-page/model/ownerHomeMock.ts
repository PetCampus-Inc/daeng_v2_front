import type { OwnerHomeData } from '@views/owner-home-page/model/ownerHome';

const ownerHomeMock: OwnerHomeData = {
  today: {
    isError: false,
    enrolledCount: 1,
    arrivalCount: 12,
    departureCount: 12,
    friends: [
      { id: 'momo', name: '모모' },
      { id: 'coco', name: '코코' },
      { id: 'bomi', name: '보미' },
      { id: 'dubu', name: '두부' },
      { id: 'choco', name: '초코' },
    ],
    extraFriendCount: 3,
  },
  noticebook: {
    isError: false,
    pendingCount: 7,
    sentCount: 12,
  },
};

export { ownerHomeMock };
