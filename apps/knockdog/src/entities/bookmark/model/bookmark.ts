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
  distances: DistanceInfo[];
}

export interface DistanceInfo {
  referencePoint: 'HOME' | 'WORK' | 'OTHER';
  distance: string;
  transitTimes: TransitTime[];
}

export interface TransitTime {
  type: 'WALKING' | 'TRANSIT' | 'DRIVING';
  time: string;
}
