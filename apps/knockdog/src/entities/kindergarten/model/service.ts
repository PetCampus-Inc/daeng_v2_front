import { DOG_BREED_MAP, DOG_SERVICE_MAP, DOG_SAFETY_FACILITY_MAP, VISITOR_AMENITY_MAP } from './constants/kindergarten';

type DogBreed = keyof typeof DOG_BREED_MAP;
type DogService = keyof typeof DOG_SERVICE_MAP;
type DogSafetyFacility = keyof typeof DOG_SAFETY_FACILITY_MAP;
type VisitorAmenity = keyof typeof VISITOR_AMENITY_MAP;

export type { DogBreed, DogService, DogSafetyFacility, VisitorAmenity };
