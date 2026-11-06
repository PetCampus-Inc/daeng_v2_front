interface LocalTimeParts {
  hour: number;
  minute: number;
  second?: number;
  nano?: number;
}

interface OwnerSchoolProfileImage {
  schoolProfileImageId: number;
  s3Key: string;
  displayOrder: number;
}

interface OwnerSchoolPriceImage {
  schoolPriceImageId: number;
  s3Key: string;
  displayOrder: number;
}

type OwnerSchoolPricingType = 'COUNT_TICKET' | 'MONTHLY_TICKET' | 'MEMBERSHIP';

interface OwnerSchoolProfile {
  schoolId: number;
  kindergartenPlaceId: string | null;
  schoolProfileId: number | null;
  thumbnailS3Key: string | null;
  profileImages: OwnerSchoolProfileImage[];
  name: string | null;
  address: string | null;
  addressDetail: string | null;
  phoneNumber: string | null;
  weekdayOpenTime: LocalTimeParts | string | number[] | null;
  weekdayCloseTime: LocalTimeParts | string | number[] | null;
  weekendOpenTime: LocalTimeParts | string | number[] | null;
  weekendCloseTime: LocalTimeParts | string | number[] | null;
  closedDays: string[];
  homepageUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  dogBreeds: string[];
  dogServices: string[];
  dogSafetyFacilities: string[];
  visitorAmenities: string[];
  pricingTypes: OwnerSchoolPricingType[];
  priceImages: OwnerSchoolPriceImage[];
  lastUpdatedAt: string | number[] | null;
}

export type {
  LocalTimeParts,
  OwnerSchoolPriceImage,
  OwnerSchoolPricingType,
  OwnerSchoolProfile,
  OwnerSchoolProfileImage,
};
