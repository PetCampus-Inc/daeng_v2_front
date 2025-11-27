import { Divider, Icon, IconButton } from '@knockdog/ui';
import { useSocialUserStore } from '@entities/social-user/model/store/useSocialUserStore';
import { SOCIAL_PROVIDER } from '@entities/social-user';

interface AccountInfo {
  nickname: string;
  userId: string;
}

interface AccountSectionProps {
  accountInfo: AccountInfo;
  onAccountClick?: () => void;
  onLocationClick?: () => void;
}

function AccountSection({ accountInfo, onAccountClick, onLocationClick }: AccountSectionProps) {
  const socialUser = useSocialUserStore((state) => state.socialUser);

  const providerIcons = {
    [SOCIAL_PROVIDER.GOOGLE]: 'GoogleLogo',
    [SOCIAL_PROVIDER.KAKAO]: 'KakaoLogo',
    [SOCIAL_PROVIDER.APPLE]: 'AppleLogo',
  } as const;

  return (
    <div className='px-4 py-5'>
      <div className='body2-semibold text-text-tertiary mb-2'>사용자 계정 관리</div>
      <div className='flex items-center justify-between gap-x-7 py-4' onClick={onAccountClick}>
        <div className=''>
          <div className='mb-2 flex items-center gap-x-1'>
            {accountInfo.nickname}
            <span className='body2-regular text-text-tertiary'>#{accountInfo.userId}</span>
          </div>

          {socialUser && (
            <div className='bg-fill-secondary-50 flex items-center rounded-lg px-4 py-3'>
              <Icon icon={providerIcons[socialUser.provider]} className='mr-1' />
              <span className='body1-regular'>{socialUser.email}</span>
            </div>
          )}
        </div>
        <div>
          <IconButton icon='ChevronRight' className='text-text-tertiary' />
        </div>
      </div>
      <Divider className='my-2' />
      <div className='flex items-center justify-between gap-x-7 py-4' onClick={onLocationClick}>
        <div className=''>
          <div className='mb-1 flex items-center gap-x-1'>내 장소 관리</div>
          <div className='body1-regular text-text-secondary'>강아지가 주로 머무르는 장소를 등록해요</div>
        </div>
        <div>
          <IconButton icon='ChevronRight' className='text-text-tertiary' />
        </div>
      </div>
    </div>
  );
}

export { AccountSection };
export type { AccountInfo };
