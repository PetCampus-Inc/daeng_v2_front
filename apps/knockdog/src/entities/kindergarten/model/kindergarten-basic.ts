import { DogBreed, DogService, DogSafetyFacility, VisitorAmenity } from './service';

// TODO: 좌표 타입 Shared로 이동
interface Coord {
  lat: number;
  lng: number;
}

interface WeekdayTime {
  time: string;
  breakTime: string;
}

interface WeekendTime {
  time: string;
  breakTime: string;
}

interface OperationTime {
  serviceTags: string;
  weekday: WeekdayTime[];
  weekend: WeekendTime[];
  closedDays: string[];
}

interface KindergartenBasic {
  id: string;
  roadAddress: string;
  coord: Coord;
  operationTimes: OperationTime[];
  dogBreeds: DogBreed[];
  dogServices: DogService[];
  dogSafetyFacilities: DogSafetyFacility[];
  visitorAmenities: VisitorAmenity[];
  homepageUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  lastUpdatedAt: string;
}

export type {
  KindergartenBasic,
  Coord,
  WeekdayTime,
  WeekendTime,
  OperationTime,
  DogBreed,
  DogService,
  DogSafetyFacility,
  VisitorAmenity,
};
