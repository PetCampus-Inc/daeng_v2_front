import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import type { OwnerPet } from '@entities/owner-pet';

interface OwnerMemberProfileHeaderProps {
  dog: OwnerPet;
}

function buildDogSummary(dog: OwnerPet) {
  const parts: string[] = [];

  if (dog.breed) parts.push(dog.breed);
  if (dog.weightKg != null) parts.push(`${dog.weightKg}kg`);
  if (dog.age != null) parts.push(`${dog.age}살`);

  return parts.join(' · ');
}

function OwnerMemberProfileHeader({ dog }: OwnerMemberProfileHeaderProps) {
  const genderIcon = dog.gender === 'MALE' ? 'Male' : 'Female';
  const summary = buildDogSummary(dog);

  return (
    <div className='bg-bg-0 flex flex-col items-center gap-2 pt-5'>
      <Avatar className='size-[120px]'>
        {dog.profileImageUrl ? (
          <AvatarImage src={dog.profileImageUrl} alt={`${dog.name} 프로필`} className='object-cover' />
        ) : null}
        <AvatarFallback className='bg-bg-50'>
          <Icon icon='Paw' className='text-fill-secondary-400 h-[52px] w-[52px]' />
        </AvatarFallback>
      </Avatar>

      <div className='flex flex-col items-center gap-1'>
        <div className='flex items-center gap-1'>
          <h1 className='h1-extrabold text-text-primary'>{dog.name}</h1>
          <Icon icon={genderIcon} className='text-text-accent size-6' />
        </div>
        {summary ? <p className='body1-medium text-text-secondary'>{summary}</p> : null}
      </div>
    </div>
  );
}

export { OwnerMemberProfileHeader };
