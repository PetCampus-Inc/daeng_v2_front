import { Divider } from '@knockdog/ui';

import type { OwnerPet } from '@entities/owner-pet';
import { formatAge } from '@entities/pet';

import { ownerMemberProfileContent } from '../config/ownerMemberProfileContent';

interface DogBasicInfoSectionProps {
  dog: OwnerPet;
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className='flex items-start justify-between gap-4 py-4'>
      <span className='body2-regular text-text-secondary shrink-0 whitespace-nowrap'>{label}</span>
      <span className='body1-bold text-text-primary min-w-0 flex-1 text-right break-words'>{value}</span>
    </div>
  );
}

function displayValue(value: string | null | undefined) {
  if (value == null || value.trim().length === 0) {
    return ownerMemberProfileContent.emptyValue;
  }

  return value;
}

function getGenderDisplay(dog: OwnerPet) {
  if (!dog.gender) return ownerMemberProfileContent.emptyValue;

  const genderLabel =
    dog.gender === 'MALE'
      ? ownerMemberProfileContent.maleDogLabel
      : ownerMemberProfileContent.femaleDogLabel;

  if (dog.isNeutered === true) {
    return `${genderLabel} (${ownerMemberProfileContent.neuteredDoneLabel})`;
  }

  if (dog.isNeutered === false) {
    return `${genderLabel} (${ownerMemberProfileContent.neuteredNotDoneLabel})`;
  }

  return genderLabel;
}

function DogBasicInfoSection({ dog }: DogBasicInfoSectionProps) {
  const weightValue =
    dog.weightKg != null ? `${dog.weightKg}kg` : ownerMemberProfileContent.emptyValue;
  const formattedAge = formatAge(dog.birthYear);
  const ageValue = formattedAge
    ? `${formattedAge} (${dog.birthYear}년생)`
    : ownerMemberProfileContent.emptyValue;

  return (
    <div className='flex flex-col gap-4 px-4 py-5'>
      <h2 className='h3-extrabold text-text-primary'>{ownerMemberProfileContent.basicInfoTitle}</h2>

      <div className='bg-bg-0 radius-r3 flex flex-col overflow-hidden px-4'>
        <InfoRow
          label={ownerMemberProfileContent.breedLabel}
          value={displayValue(dog.breed)}
        />
        <Divider />
        <InfoRow label={ownerMemberProfileContent.genderLabel} value={getGenderDisplay(dog)} />
        <Divider />
        <InfoRow label={ownerMemberProfileContent.weightLabel} value={weightValue} />
        <Divider />
        <InfoRow label={ownerMemberProfileContent.ageLabel} value={ageValue} />
      </div>
    </div>
  );
}

export { DogBasicInfoSection };
