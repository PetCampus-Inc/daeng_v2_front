interface OwnerPetDto {
  petId: number | string;
  name: string;
  profileImage?: string | null;
  gender: 'MALE' | 'FEMALE' | string;
  isNeutered?: boolean | null;
  breed?: string | null;
  weight?: number | null;
  birthYear?: number | null;
  age?: number | null;
}

interface OwnerPet {
  petId: string;
  name: string;
  profileImageUrl: string | null;
  gender: 'MALE' | 'FEMALE';
  isNeutered: boolean;
  breed: string;
  weightKg: number | null;
  birthYear: number | null;
  age: number | null;
}

function normalizeGender(value: unknown): 'MALE' | 'FEMALE' {
  return value === 'FEMALE' ? 'FEMALE' : 'MALE';
}

function toOwnerPet(dto: OwnerPetDto | null | undefined): OwnerPet | null {
  if (!dto || dto.petId === null || dto.petId === undefined) return null;

  return {
    petId: String(dto.petId),
    name: dto.name ?? '',
    profileImageUrl: dto.profileImage ?? null,
    gender: normalizeGender(dto.gender),
    isNeutered: Boolean(dto.isNeutered),
    breed: dto.breed ?? '',
    weightKg: typeof dto.weight === 'number' ? dto.weight : null,
    birthYear: typeof dto.birthYear === 'number' ? dto.birthYear : null,
    age: typeof dto.age === 'number' ? dto.age : null,
  };
}

export { toOwnerPet };
export type { OwnerPet, OwnerPetDto };
