import { Divider } from '@knockdog/ui';

interface SettingsSectionProps {
  variant?: 'guardian' | 'owner';
  otherInfoTitle?: string;
  logoutLabel?: string;
  withdrawLabel?: string;
  onNoticeClick?: () => void;
  onNotificationClick?: () => void;
  onTermsClick?: () => void;
  onLicenseClick?: () => void;
  onLogoutClick?: () => void;
  onWithdrawClick?: () => void;
}

function SettingsSection({
  variant = 'guardian',
  otherInfoTitle = '기타 정보',
  logoutLabel = '로그아웃',
  withdrawLabel = '탈퇴하기',
  onNoticeClick,
  onNotificationClick,
  onTermsClick,
  onLicenseClick,
  onLogoutClick,
  onWithdrawClick,
}: SettingsSectionProps) {
  if (variant === 'owner') {
    return (
      <>
        <div className='flex flex-col gap-2 px-4 py-5'>
          <p className='body2-semibold text-text-tertiary'>{otherInfoTitle}</p>

          <button type='button' className='body1-medium py-4 text-left' onClick={onTermsClick}>
            이용약관
          </button>
          <Divider />
          <button type='button' className='body1-medium py-4 text-left' onClick={onLicenseClick}>
            오픈소스 라이선스
          </button>
        </div>

        <div className='flex items-center justify-center gap-x-4 p-4'>
          <button type='button' className='label-semibold text-text-tertiary' onClick={onLogoutClick}>
            {logoutLabel}
          </button>
          <Divider orientation='vertical' className='h-3.5' />
          <button type='button' className='label-semibold text-text-tertiary' onClick={onWithdrawClick}>
            {withdrawLabel}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className='bg-primitive-neutral-50'>
      <div className='px-4 py-5'>
        <div className='body2-semibold text-text-tertiary mb-2'>기타 정보</div>
        <div>
          <button type='button' className='body1-medium flex h-14 w-full items-center text-left' onClick={onNoticeClick}>
            공지사항
          </button>
          <Divider />
        </div>
        <div>
          <button type='button' className='body1-medium flex h-14 w-full items-center text-left' onClick={onNotificationClick}>
            알림 설정
          </button>
          <Divider />
        </div>
        <div>
          <button type='button' className='body1-medium flex h-14 w-full items-center text-left' onClick={onTermsClick}>
            이용약관
          </button>
        </div>
      </div>

      <div className='flex items-center justify-center gap-4 p-4'>
        <button type='button' className='label-semibold px-2 py-1 text-text-tertiary' onClick={onLogoutClick}>
          {logoutLabel}
        </button>
        <Divider orientation='vertical' className='h-3.5' />
        <button type='button' className='label-semibold px-2 py-1 text-text-tertiary' onClick={onWithdrawClick}>
          {withdrawLabel}
        </button>
      </div>
    </div>
  );
}

export { SettingsSection };
