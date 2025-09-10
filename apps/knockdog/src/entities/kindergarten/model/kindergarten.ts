type OperationStatus = 'OPEN' | 'CLOSED' | 'DAY_OFF';

interface Kindergarten {
  id: string;
  title: string;
  ctg: string;
  operationDescription: string;
  operationStatus: OperationStatus;
  price: number;
  dist: number;
  roadAddress: string;
  reviewCount: number;
  serviceTags: string[];
  images: string[];
  bookmarked: boolean;
  memoDate: string;
}

export type { Kindergarten, OperationStatus };
