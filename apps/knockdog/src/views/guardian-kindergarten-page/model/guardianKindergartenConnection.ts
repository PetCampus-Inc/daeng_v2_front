type GuardianKindergartenConnectionStatus = 'none' | 'pending' | 'approved' | 'disconnected';

interface GuardianLinkedKindergarten {
  /** schoolId — 앨범 등 school 스코프 API */
  id: string;
  /** kindergartenPlaceId — 상세 `/kindergarten/{placeId}` */
  placeId: string | null;
  name: string;
  address: string;
  imageUrl: string;
}

export type { GuardianKindergartenConnectionStatus, GuardianLinkedKindergarten };
