import type { ReactNode } from 'react';

import { ActionButton, Divider, Icon, IconButton } from '@knockdog/ui';
import { SOCIAL_PROVIDER_ICONS, useSocialUserStore } from '@entities/social-user';

interface AccountInfo {
  nickname: string;
  userId: string;
}

interface AccountSectionProps {
  variant?: 'guardian' | 'owner';
  accountInfo?: AccountInfo;
  accountSectionTitle?: string;
  releasePermissionLabel?: string;
  releasePermissionPendingNotice?: string;
  headerAddon?: ReactNode;
  onAccountClick?: () => void;
  onLocationClick?: () => void;
}

function AccountSection({
  variant = 'guardian',
  accountInfo,
  accountSectionTitle = '내 계정',
  releasePermissionLabel,
  releasePermissionPendingNotice,
  headerAddon,
  onAccountClick,
  onLocationClick,
}: AccountSectionProps) {
  const socialUser = useSocialUserStore((state) => state.socialUser);

  if (variant === 'owner') {
    return (
      <div className='flex flex-col gap-4 px-4 py-5'>
        <h2 className='h3-semibold text-text-primary'>{accountSectionTitle}</h2>

        {socialUser ? (
          <div className='bg-fill-secondary-50 flex items-center gap-x-1 rounded-lg px-4 py-3'>
            <Icon icon={SOCIAL_PROVIDER_ICONS[socialUser.provider]} className='size-4' />
            <span className='body1-regular text-text-primary truncate'>{socialUser.email}</span>
          </div>
        ) : null}

        {releasePermissionLabel ? (
          <ActionButton
            type='button'
            variant='secondaryLine'
            className='w-full'
            disabled
            title={releasePermissionPendingNotice}
          >
            {releasePermissionLabel}
          </ActionButton>
        ) : null}
      </div>
    );
  }

  if (!accountInfo) return null;

  return (
    <div className='px-4 py-5'>
      <div className='body2-semibold text-text-tertiary mb-2'>사용자 계정 관리</div>
      {headerAddon}
      {headerAddon ? <Divider className='my-2' /> : null}
      <div className='flex items-center justify-between gap-x-7 py-4' onClick={onAccountClick}>
        <div className=''>
          <div className='h3-semibold text-text-primary mb-2 flex items-center gap-x-1'>
            {accountInfo.nickname}
            <span className='body2-regular text-text-secondary'>#{accountInfo.userId}</span>
          </div>

          {socialUser && (
            <div className='bg-fill-secondary-50 flex items-center rounded-lg px-4 py-3'>
              <Icon icon={SOCIAL_PROVIDER_ICONS[socialUser.provider]} className='mr-1' />
              <span className='body2-regular text-text-secondary'>{socialUser.email}</span>
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
          <div className='h3-semibold text-text-primary mb-1'>내 장소 관리</div>
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
