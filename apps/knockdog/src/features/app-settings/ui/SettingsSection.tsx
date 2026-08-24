import { Divider } from '@knockdog/ui';

interface SettingsSectionProps {
  otherInfoTitle?: string;
  logoutLabel?: string;
  withdrawLabel?: string;
  onNoticeClick?: () => void;
  onNotificationClick?: () => void;
  onTermsClick?: () => void;
  onLogoutClick?: () => void;
  onWithdrawClick?: () => void;
}

function SettingsSection({
  otherInfoTitle = '기타 정보',
  logoutLabel = '로그아웃',
  withdrawLabel = '탈퇴하기',
  onNoticeClick,
  onNotificationClick,
  onTermsClick,
  onLogoutClick,
  onWithdrawClick,
}: SettingsSectionProps) {
  return (
    <div className='bg-primitive-neutral-50'>
      <div className='px-4 py-5'>
        <div className='body2-semibold text-text-tertiary mb-2'>{otherInfoTitle}</div>
        <div>
          <button type='button' className='body1-medium flex h-14 w-full items-center text-left' onClick={onNoticeClick}>
            공지사항
          </button>
          <Divider />
        </div>
        <div>
          <button
            type='button'
            className='body1-medium flex h-14 w-full items-center text-left'
            onClick={onNotificationClick}
          >
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
