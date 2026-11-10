import { formatAge } from '@entities/pet';

interface DogMetaInput {
  breed?: string | null;
  weightKg?: number | null;
  birthYear?: number | null;
}

/** 견종·몸무게·나이 중 값이 있는 항목만 순서대로 돌려준다. */
function getDogMetaParts({ breed, weightKg, birthYear }: DogMetaInput): string[] {
  const parts: string[] = [];
  const trimmedBreed = breed?.trim();

  if (trimmedBreed) parts.push(trimmedBreed);
  if (weightKg != null) parts.push(`${weightKg}kg`);

  const ageLabel = formatAge(birthYear);
  if (ageLabel) parts.push(ageLabel);

  return parts;
}

export { getDogMetaParts };
export type { DogMetaInput };
