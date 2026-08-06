import type { ReactNode } from 'react';

import { ActionButton, Divider, Icon, IconButton } from '@knockdog/ui';
import {
  SOCIAL_PROVIDER_ICONS,
  useSocialUserStore,
  type SocialProvider,
} from '@entities/social-user';
import { useClipboardCopy } from '@shared/lib/device';
import { toast } from '@shared/ui/toast';

interface AccountInfo {
  nickname: string;
  userId: string;
}

interface AccountSectionProps {
  variant?: 'guardian' | 'owner';
  accountInfo?: AccountInfo;
  accountSectionTitle?: string;
  ttokIdLabel?: string;
  ttokIdDescription?: string;
  releasePermissionLabel?: string;
  headerAddon?: ReactNode;
  /** owner variant 계정 표시용. undefined일 때만 socialUser store로 폴백 (null/'' 유지) */
  socialProvider?: SocialProvider | null;
  socialEmail?: string;
  onAccountClick?: () => void;
  onLocationClick?: () => void;
  onReleasePermissionClick?: () => void;
}

function AccountSection({
  variant = 'guardian',
  accountInfo,
  accountSectionTitle = '내 계정',
  ttokIdLabel = '똑똑 ID',
  ttokIdDescription = '문의 시 사용되는 ID예요',
  releasePermissionLabel,
  headerAddon,
  socialProvider,
  socialEmail,
  onAccountClick,
  onLocationClick,
  onReleasePermissionClick,
}: AccountSectionProps) {
  const socialUser = useSocialUserStore((state) => state.socialUser);
  const copy = useClipboardCopy();

  const handleCopyUserId = async () => {
    if (!accountInfo?.userId) return;

    const displayUserId = `#${accountInfo.userId}`;
    const isCopied = await copy(displayUserId);
    if (!isCopied) return;

    toast({
      type: 'success',
      shape: 'rounded',
      position: 'bottom',
      nativeTitle: `${ttokIdLabel}를 복사했어요`,
      titleParts: [
        { text: ttokIdLabel, accent: true },
        { text: '를 복사했어요' },
      ],
      title: (
        <>
          <span className='body1-bold text-text-accent'>{ttokIdLabel}</span>
          <span className='body1-medium text-text-primary-inverse'>를 복사했어요</span>
        </>
      ),
    });
  };

  if (variant === 'owner') {
    // undefined(미지정)만 store 폴백. null / '' 는 명시값으로 유지
    const provider = socialProvider !== undefined ? socialProvider : (socialUser?.provider ?? null);
    const email = socialEmail !== undefined ? socialEmail : (socialUser?.email ?? '');

    return (
      <div className='px-4 py-5'>
        <h2 className='body2-semibold text-text-tertiary'>{accountSectionTitle}</h2>

        <div className='mt-8 flex flex-col gap-4'>
          {accountInfo?.userId ? (
            <div className='flex min-w-0 flex-col'>
              <span className='body1-bold text-text-primary'>{ttokIdLabel}</span>
              <div className='flex items-center justify-between gap-3'>
                <span className='body2-regular text-text-secondary min-w-0 truncate'>
                  {ttokIdDescription}
                </span>
                <button
                  type='button'
                  className='flex shrink-0 items-center gap-2'
                  aria-label={`${ttokIdLabel} 복사`}
                  onClick={handleCopyUserId}
                >
                  <span className='h3-semibold text-text-primary'>#{accountInfo.userId}</span>
                  <Icon icon='Copy' className='text-text-secondary size-5' />
                </button>
              </div>
            </div>
          ) : null}

          {provider && email ? (
            <div className='bg-fill-secondary-50 flex items-center gap-x-1 rounded-lg px-4 py-3'>
              <Icon icon={SOCIAL_PROVIDER_ICONS[provider]} className='size-4' />
              <span className='body1-regular text-text-primary truncate'>{email}</span>
            </div>
          ) : null}

          {releasePermissionLabel ? (
            <ActionButton
              type='button'
              variant='secondaryLine'
              className='w-full'
              onClick={onReleasePermissionClick}
            >
              {releasePermissionLabel}
            </ActionButton>
          ) : null}
        </div>
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
