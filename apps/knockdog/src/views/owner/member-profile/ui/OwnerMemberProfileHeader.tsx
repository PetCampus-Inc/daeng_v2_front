import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import type { OwnerPet } from '@entities/owner-pet';
import { DogMetaLine } from '@shared/ui/dog-meta-line';

interface OwnerMemberProfileHeaderProps {
  dog: OwnerPet;
}

function OwnerMemberProfileHeader({ dog }: OwnerMemberProfileHeaderProps) {
  const genderIcon = dog.gender === 'MALE' ? 'Male' : dog.gender === 'FEMALE' ? 'Female' : null;

  return (
    <div className='bg-bg-0 flex w-full min-w-0 flex-col items-center gap-2 pt-5'>
      <Avatar className='size-[120px]'>
        {dog.profileImageUrl ? (
          <AvatarImage src={dog.profileImageUrl} alt={`${dog.name} 프로필`} className='object-cover' />
        ) : null}
        <AvatarFallback className='bg-bg-50'>
          <Icon icon='Paw' className='text-fill-secondary-400 h-[52px] w-[52px]' />
        </AvatarFallback>
      </Avatar>

      <div className='flex w-full min-w-0 flex-col items-center gap-1 px-4'>
        <div className='flex max-w-full min-w-0 items-center gap-1'>
          <h1 className='h1-extrabold text-text-primary min-w-0 truncate'>{dog.name}</h1>
          {genderIcon ? <Icon icon={genderIcon} className='text-text-accent size-6 shrink-0' /> : null}
        </div>
        <DogMetaLine
          breed={dog.breed}
          weightKg={dog.weightKg}
          birthYear={dog.birthYear}
          centered
          className='body1-medium text-text-secondary'
        />
      </div>
    </div>
  );
}

export { OwnerMemberProfileHeader };
