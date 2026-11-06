interface OwnerHomePetPreview {
  id: string;
  name: string;
  profileImageUrl?: string;
}

interface OwnerHomeData {
  today: {
    isError: boolean;
    enrolledCount: number;
    arrivalCount: number;
    departureCount: number;
    friends: OwnerHomePetPreview[];
    extraFriendCount: number;
  };
  noticebook: {
    isError: boolean;
    pendingCount: number;
    sentCount: number;
  };
}

export type { OwnerHomeData, OwnerHomePetPreview };
