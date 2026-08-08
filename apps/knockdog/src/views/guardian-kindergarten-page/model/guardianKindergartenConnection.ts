type GuardianKindergartenConnectionStatus = 'none' | 'pending' | 'approved' | 'disconnected';

interface GuardianLinkedKindergarten {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
}

export type { GuardianKindergartenConnectionStatus, GuardianLinkedKindergarten };
