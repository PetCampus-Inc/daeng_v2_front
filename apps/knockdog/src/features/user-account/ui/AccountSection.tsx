import type { ReactNode } from 'react';

import { ActionButton, Divider, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
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

export interface AccountSectionProps {
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
  onConnectionHistoryClick?: () => void;
  onConnectionApplicationsClick?: () => void;
  onMyReviewsClick?: () => void;
  onReleasePermissionClick?: () => void;
}

function SocialAccountEmailField({
  provider,
  email,
  surfaceClassName = 'bg-fill-secondary-50 rounded-lg',
}: {
  provider?: SocialProvider | null;
  email: string;
  /** 배경색과 모서리 반지름. 기본값은 원장 화면 기준이다. */
  surfaceClassName?: string;
}) {
  return (
    <div className={cn('border-line-200 flex h-12 items-center border px-4', surfaceClassName)}>
      {provider ? (
        <Icon
          icon={SOCIAL_PROVIDER_ICONS[provider]}
          className={provider === 'APPLE' ? 'size-5 text-text-tertiary' : 'size-5'}
        />
      ) : null}
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
  onConnectionHistoryClick,
  onConnectionApplicationsClick,
  onMyReviewsClick,
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
      <div className='bg-bg-0 px-4 pt-5 pb-7'>
        <h2 className='label-medium text-text-secondary px-1'>{accountSectionTitle}</h2>

        <div className='mt-4 flex flex-col gap-2'>
          {accountInfo?.userId ? (
            <div className='flex items-center justify-between gap-2 px-3 py-2'>
              <div className='flex min-w-0 flex-col gap-1'>
                <span className='body1-medium text-text-primary'>{ttokIdLabel}</span>
                <span className='caption1-regular text-text-tertiary truncate'>{ttokIdDescription}</span>
              </div>
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
          ) : null}

          <SocialAccountEmailField provider={provider} email={email} />

          {releasePermissionLabel ? (
            <ActionButton
              type='button'
              variant='secondaryLine'
              size='large'
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

  const guardianMenuItems = [
    { label: '보호자 프로필', icon: 'User' as const, caption: '보호자의 프로필 정보를 설정할 수 있어요.', onClick: onProfileClick },
    { label: '내 장소 관리', icon: 'LocationLine' as const, caption: '집 외 1개의 주소를 등록하고 관리할 수 있어요.', onClick: onLocationClick },
    { label: '유치원 연결 내역', icon: 'Kindergarten' as const, caption: '유치원 연결 내역을 보고 관리할 수 있어요.', onClick: onConnectionHistoryClick },
    { label: '연결 신청 현황', icon: 'Note' as const, caption: '보낸 연결 신청의 처리 상태를 확인할 수 있어요.', onClick: onConnectionApplicationsClick },
    { label: '내 리뷰 관리', icon: 'Note' as const, caption: '작성한 유치원 리뷰를 보고 관리할 수 있어요.', onClick: onMyReviewsClick },
  ];

  const guardianSocialProvider = socialProvider ?? socialUser?.provider;
  const guardianSocialEmail = socialEmail ?? socialUser?.email ?? '';

  return (
    <div className='px-4 py-5'>
      <div className='flex flex-col'>
        <section className='flex flex-col gap-4 pb-4'>
          <h2 className='body2-medium text-text-secondary'>내 정보</h2>
          {headerAddon}
          <div>
            {guardianMenuItems.map((item) => (
              <button
                key={item.label}
                type='button'
                className='border-line-100 flex w-full items-center gap-2 border-b py-4 text-left last:border-b-0'
                onClick={() => item.onClick?.()}
              >
                <span className='bg-primitive-orange-50 radius-r2 flex size-12 shrink-0 items-center justify-center'>
                  <Icon icon={item.icon} className='text-primitive-orange-300 size-6' />
                </span>
                <span className='flex min-w-0 flex-1 flex-col gap-1'>
                  <span className='body1-medium text-text-primary'>{item.label}</span>
                  <span className='caption1-regular text-primitive-neutral-500'>{item.caption}</span>
                </span>
                <Icon icon='ChevronRight' className='text-primitive-neutral-500 size-4' />
              </button>
            ))}
          </div>
        </section>

        <Divider />

        <section className='mt-5 flex flex-col gap-4'>
          <h2 className='body2-medium text-text-secondary'>계정 정보</h2>
          <div>
            <div className='flex h-[76px] items-end justify-between gap-4 py-4'>
              <div className='flex flex-col'>
                <span className='body1-medium text-text-primary'>{ttokIdLabel}</span>
                <span className='caption1-regular text-primitive-neutral-500'>{ttokIdDescription}</span>
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

            <SocialAccountEmailField
              provider={guardianSocialProvider}
              email={guardianSocialEmail}
              surfaceClassName='radius-r3 bg-bg-50'
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export { AccountSection };
export type { AccountInfo };
