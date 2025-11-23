const RELATIONSHIP = {
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  FAMILY: 'FAMILY',
  GUARDIAN: 'GUARDIAN',
  ETC: 'ETC',
} as const;

type Relationship = keyof typeof RELATIONSHIP;

const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

type Gender = keyof typeof GENDER;

interface Pet {
  id: string;
  name: string;
  breed: string;
  gender: Gender;
  birthYear: number;
  isNeutered: boolean;
  weight: number;
  relation: Relationship;
}

export type { Pet, Relationship, Gender };
export { RELATIONSHIP, GENDER };
