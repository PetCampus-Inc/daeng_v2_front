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
  memos: MemoItem[];
}

export interface MemoItem {
  shopId: string;
  memoDate: string;
  content: string;
}
