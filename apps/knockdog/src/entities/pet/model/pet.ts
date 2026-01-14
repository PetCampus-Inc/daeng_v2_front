const RELATIONSHIP = {
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  ELDER_SISTER: 'ELDER_SISTER',
  ELDER_BROTHER: 'ELDER_BROTHER',
  OLDER_SISTER: 'OLDER_SISTER',
  OLDER_BROTHER: 'OLDER_BROTHER',
  GUARDIAN: 'GUARDIAN',
  ETC: 'ETC',
} as const;

const RELATIONSHIP_LABEL = {
  MOTHER: '엄마',
  FATHER: '아빠',
  ELDER_SISTER: '언니',
  ELDER_BROTHER: '오빠',
  OLDER_SISTER: '누나',
  OLDER_BROTHER: '형',
  GUARDIAN: '보호자',
  ETC: '기타(직접 입력)',
} as const;

type Relationship = keyof typeof RELATIONSHIP;

const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

type Gender = keyof typeof GENDER;

interface Pet {
  id: string;
  profileImage?: string;
  name: string;
  breed: string;
  gender: Gender;
  birthYear: number;
  isNeutered: boolean;
  isRepresentative: boolean;
  weight: number;
  relationship: Relationship;
  relationshipText: string;
}

export type { Pet, Relationship, Gender };
export { RELATIONSHIP, GENDER, RELATIONSHIP_LABEL };
