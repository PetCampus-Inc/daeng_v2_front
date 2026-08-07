type GuardianKindergartenConnectionStatus = 'none' | 'pending';

interface GuardianPendingKindergarten {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
}

export type { GuardianKindergartenConnectionStatus, GuardianPendingKindergarten };
