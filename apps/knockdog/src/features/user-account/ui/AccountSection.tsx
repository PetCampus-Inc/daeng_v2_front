import type { ReactNode } from 'react';

import { ActionButton, Divider, Icon } from '@knockdog/ui';
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
  /** owner variant 계정 표시용. 값이 없으면 socialUser store를 사용한다. */
  socialProvider?: SocialProvider | null;
  socialEmail?: string;
  onProfileClick?: () => void;
  onLocationClick?: () => void;
  onConnectionApplicationsClick?: () => void;
  onReleasePermissionClick?: () => void;
}

function SocialAccountEmailField({
  provider,
  email,
}: {
  provider?: SocialProvider | null;
  email: string;
}) {
  return (
    <div className='border-line-200 bg-fill-secondary-50 flex h-12 items-center rounded-lg border px-4'>
      {provider ? <Icon icon={SOCIAL_PROVIDER_ICONS[provider]} className='mr-1 size-5' /> : null}
      <span className='body1-regular text-text-secondary truncate'>
        {email}
      </span>
    </div>
  );
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
  onProfileClick,
  onLocationClick,
  onConnectionApplicationsClick,
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
    const provider = socialProvider ?? socialUser?.provider ?? null;
    const email =
      socialEmail || socialUser?.email || '';

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

          <SocialAccountEmailField provider={provider} email={email} />

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

  const guardianSocialProvider = socialProvider ?? socialUser?.provider;
  const guardianSocialEmail = socialEmail ?? socialUser?.email ?? '';

  return (
    <div className='px-4 py-5'>
      <div className='flex flex-col'>
        <section className='flex flex-col gap-4 pb-4'>
          <h2 className='body2-semibold text-text-tertiary'>내 정보</h2>
          {headerAddon}
          <div>
            <button
              type='button'
              className='flex h-14 w-full items-center gap-2 py-4 text-left'
              onClick={onProfileClick}
            >
              <span className='body1-medium flex-1 text-text-primary'>보호자 프로필</span>
              <Icon icon='ChevronRight' className='size-6 text-text-tertiary' />
            </button>
            <button
              type='button'
              className='flex h-14 w-full items-center gap-2 py-4 text-left'
              onClick={onLocationClick}
            >
              <span className='body1-medium flex-1 text-text-primary'>내 장소 관리</span>
              <Icon icon='ChevronRight' className='size-6 text-text-tertiary' />
            </button>
            <button
              type='button'
              className='flex h-14 w-full items-center gap-2 py-4 text-left'
              onClick={onConnectionApplicationsClick}
            >
              <span className='body1-medium flex-1 text-text-primary'>연결 신청 내역</span>
              <Icon icon='ChevronRight' className='size-6 text-text-tertiary' />
            </button>
          </div>
        </section>

        <Divider />

        <section className='mt-5 flex flex-col gap-4'>
          <h2 className='body2-semibold text-text-tertiary'>계정 정보</h2>
          <div>
            <div className='flex h-[76px] items-end justify-between gap-4 py-4'>
              <div className='flex flex-col'>
                <span className='body1-medium text-text-primary'>{ttokIdLabel}</span>
                <span className='body2-regular text-text-tertiary'>{ttokIdDescription}</span>
              </div>
              <button
                type='button'
                className='flex items-center gap-2'
                aria-label={`${ttokIdLabel} 복사`}
                onClick={handleCopyUserId}
              >
                <span className='h3-semibold text-text-primary'>#{accountInfo.userId}</span>
                <Icon icon='Copy' className='size-5 text-text-secondary' />
              </button>
            </div>

            <SocialAccountEmailField provider={guardianSocialProvider} email={guardianSocialEmail} />
          </div>
        </section>
      </div>
    </div>
  );
}

export { AccountSection };
export type { AccountInfo };
