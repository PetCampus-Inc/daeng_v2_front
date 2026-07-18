import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';

import type { OwnerMemberProfile } from '../config/ownerMemberProfileContent';

interface OwnerMemberProfileHeaderProps {
  dog: OwnerMemberProfile['dog'];
}

function OwnerMemberProfileHeader({ dog }: OwnerMemberProfileHeaderProps) {
  const genderIcon = dog.gender === 'MALE' ? 'Male' : 'Female';
  const summary = `${dog.breed} · ${dog.weightKg}kg · ${dog.age}살`;

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
        <p className='body1-medium text-text-secondary'>{summary}</p>
      </div>
    </div>
  );
}

export { OwnerMemberProfileHeader };
