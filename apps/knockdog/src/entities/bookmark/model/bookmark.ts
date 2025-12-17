export interface BookmarkResponse {
  data: BookmarkItem[];
}

export interface BookmarkItem {
  id: string;
  name: string;
  thumbnailS3Key: string;
  categories: string[];
  location: string;
  price: number;
  reviewCount: number;
  memoAt?: LocalDateTime;
  distances: DistanceInfo[];
}

export type LocalDateTime = readonly [
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  nanosecond: number,
];

export interface DistanceInfo {
  referencePoint: 'HOME' | 'WORK' | 'OTHER';
  distance: string;
  transitTimes: TransitTime[];
}

export interface TransitTime {
  type: 'WALKING' | 'TRANSIT' | 'DRIVING';
  time: string;
}
