interface OwnerKindergartenNewsItem {
  id: string;
  /** 중요/공지*/
  isAnnouncement: boolean;
  /** 미확인 */
  isUnread: boolean;
  /** 표시용 시각 라벨*/
  publishedAtLabel: string;
  readCount: number;
  title: string;
  /** 줄바꿈 포함 가능, 목록에서는 최대 2줄 */
  body: string;
  thumbnailUrl: string | null;
}

export type { OwnerKindergartenNewsItem };
