export interface Photo {
  key: string;
  sha256: string;
}

export interface Memo {
  photos: File[];
  content: string;
  updatedAt: string;
}

export interface MemoList {
  memos: {
    shopId: number;
    memoDate: string;
    content: string;
  }[];
}
