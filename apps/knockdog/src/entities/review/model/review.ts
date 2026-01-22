interface Review {
  reviewIdx: string;
  username: string;
  profileImage: string;
  title: string;
  content: string;
  updatedAt: string;
  reviewUrl?: string;
}

export type { Review };
