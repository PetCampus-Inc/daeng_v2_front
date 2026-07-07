import { Avatar, AvatarFallback, AvatarImage, Divider } from '@knockdog/ui';

import { ownerMypageContent } from '../config/ownerMypageContent';
import type { OwnerProfile } from '../model/ownerProfile';

interface OwnerProfileDetailInfoProps {
  profile: OwnerProfile;
}

function OwnerProfileDetailInfo({ profile }: OwnerProfileDetailInfoProps) {
  const rows = [
    { label: ownerMypageContent.ownerNameLabel, value: profile.name },
    { label: ownerMypageContent.ownerPhoneLabel, value: profile.phoneNumber },
    { label: ownerMypageContent.ownerEmailLabel, value: profile.email },
  ];

  return (
    <div>
      <div className='flex flex-col items-center gap-y-4 px-4 py-5'>
        <Avatar className='size-[120px]'>
          {profile.profileImageUrl ? (
            <AvatarImage src={profile.profileImageUrl} alt={profile.name} className='object-cover' />
          ) : null}
          <AvatarFallback className='bg-fill-secondary-50' />
        </Avatar>

        <span className='h3-extrabold text-text-primary'>{profile.name}</span>
      </div>

      <div className='px-4 pt-5'>
        <div className='flex flex-col'>
          {rows.map((row, index) => (
            <div key={row.label}>
              <div className='flex items-center justify-between p-4'>
                <span className='body1-medium text-text-primary'>{row.label}</span>
                <span className='body1-bold text-text-primary'>{row.value}</span>
              </div>
              {index < rows.length - 1 ? <Divider /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { OwnerProfileDetailInfo };
export type { OwnerProfileDetailInfoProps };
