import { Divider } from '@knockdog/ui';

import {
  ownerMemberProfileContent,
  type OwnerMemberProfile,
} from '../config/ownerMemberProfileContent';

interface DogBasicInfoSectionProps {
  dog: OwnerMemberProfile['dog'];
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className='flex items-center justify-between py-4'>
      <span className='body2-regular text-text-secondary'>{label}</span>
      <span className='body1-bold text-text-primary'>{value}</span>
    </div>
  );
}

function getGenderDisplay(dog: OwnerMemberProfile['dog']) {
  const genderLabel =
    dog.gender === 'MALE'
      ? ownerMemberProfileContent.maleDogLabel
      : ownerMemberProfileContent.femaleDogLabel;
  const neuteredLabel = dog.isNeutered
    ? ownerMemberProfileContent.neuteredDoneLabel
    : ownerMemberProfileContent.neuteredNotDoneLabel;

  return `${genderLabel} (${neuteredLabel})`;
}

function DogBasicInfoSection({ dog }: DogBasicInfoSectionProps) {
  return (
    <div className='flex flex-col gap-4 px-4 py-5'>
      <h2 className='h3-extrabold text-text-primary'>{ownerMemberProfileContent.basicInfoTitle}</h2>

      <div className='bg-bg-0 radius-r3 flex flex-col overflow-hidden px-4'>
        <InfoRow label={ownerMemberProfileContent.breedLabel} value={dog.breed} />
        <Divider />
        <InfoRow label={ownerMemberProfileContent.genderLabel} value={getGenderDisplay(dog)} />
        <Divider />
        <InfoRow
          label={ownerMemberProfileContent.weightLabel}
          value={`${dog.weightKg}kg`}
        />
        <Divider />
        <InfoRow
          label={ownerMemberProfileContent.ageLabel}
          value={`${dog.age}살 (${dog.birthYear}년생)`}
        />
      </div>
    </div>
  );
}

export { DogBasicInfoSection };
