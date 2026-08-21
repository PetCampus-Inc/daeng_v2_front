interface OwnerPetDto {
  petId: number | string;
  name: string;
  profileImage?: string | null;
  gender?: 'MALE' | 'FEMALE' | string | null;
  isNeutered?: boolean | null;
  breed?: string | null;
  weight?: number | null;
  birthYear?: number | null;
  age?: number | null;
}

interface OwnerPetGuardianDto {
  name?: string | null;
  gender?: 'MALE' | 'FEMALE' | string | null;
  phoneNumber?: string | null;
  emergencyPhoneNumber?: string | null;
  roadAddress?: string | null;
  address?: string | null;
  addressDetail?: string | null;
  guardianAddressDetail?: string | null;
}

interface OwnerPet {
  petId: string;
  name: string;
  profileImageUrl: string | null;
  gender: 'MALE' | 'FEMALE' | null;
  isNeutered: boolean | null;
  breed: string;
  weightKg: number | null;
  birthYear: number | null;
  age: number | null;
}

interface OwnerPetGuardian {
  name: string;
  gender: 'MALE' | 'FEMALE' | string;
  phone: string;
  emergencyPhone: string;
  address: string;
  addressDetail?: string;
}

function normalizeGender(value: unknown): 'MALE' | 'FEMALE' | null {
  if (value === 'MALE') return 'MALE';
  if (value === 'FEMALE') return 'FEMALE';
  return null;
}

function normalizeIsNeutered(value: unknown): boolean | null {
  if (value === true) return true;
  if (value === false) return false;
  return null;
}

function toOwnerPet(dto: OwnerPetDto | null | undefined): OwnerPet | null {
  if (!dto || dto.petId === null || dto.petId === undefined) return null;

  return {
    petId: String(dto.petId),
    name: dto.name ?? '',
    profileImageUrl: dto.profileImage ?? null,
    gender: normalizeGender(dto.gender),
    isNeutered: normalizeIsNeutered(dto.isNeutered),
    breed: dto.breed ?? '',
    weightKg: typeof dto.weight === 'number' ? dto.weight : null,
    birthYear: typeof dto.birthYear === 'number' ? dto.birthYear : null,
    age: typeof dto.age === 'number' ? dto.age : null,
  };
}

function toOwnerPetGuardian(dto: OwnerPetGuardianDto | null | undefined): OwnerPetGuardian | null {
  if (!dto) return null;

  const roadAddress = dto.roadAddress?.trim() ?? '';
  const address = dto.address?.trim() ?? '';
  const addressDetail = dto.addressDetail?.trim() || dto.guardianAddressDetail?.trim() || undefined;

  return {
    name: dto.name?.trim() ?? '',
    gender: dto.gender ?? '',
    phone: dto.phoneNumber?.trim() ?? '',
    emergencyPhone: dto.emergencyPhoneNumber?.trim() ?? '',
    address: roadAddress || address,
    addressDetail,
  };
}

export { toOwnerPet, toOwnerPetGuardian };
export type {
  OwnerPet,
  OwnerPetDto,
  OwnerPetGuardian,
  OwnerPetGuardianDto,
};
