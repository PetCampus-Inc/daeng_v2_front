const RELATIONSHIP = {
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  FAMILY: 'FAMILY',
  GUARDIAN: 'GUARDIAN',
  ETC: 'ETC',
} as const;

const RELATIONSHIP_LABEL = {
  MOTHER: '엄마',
  FATHER: '아빠',
  FAMILY: '가족',
  GUARDIAN: '보호자',
  ETC: '기타',
} as const;

type Relationship = keyof typeof RELATIONSHIP;

const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

type Gender = keyof typeof GENDER;

interface Pet {
  id: string;
  profileImageUrl?: string;
  name: string;
  breed: string;
  gender: Gender;
  birthYear: number;
  isNeutered: boolean;
  isRepresentative: boolean;
  weight: number;
  relationship: Relationship;
}

export type { Pet, Relationship, Gender };
export { RELATIONSHIP, GENDER, RELATIONSHIP_LABEL };
