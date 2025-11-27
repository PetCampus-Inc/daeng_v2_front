'use client';

import { Header } from '@widgets/Header';
import { Divider, Icon, Switch } from '@knockdog/ui';
import { MarketingConsentSheet } from '@features/marketing-consent';
import { overlay } from 'overlay-kit';
import { useStackNavigation } from '@shared/lib/bridge';
import { usePushSettingQuery, usePushSettingMutation, type PushSetting } from '@entities/user';

function AlarmSettingPage() {
  const { push } = useStackNavigation();
  const { data: pushSetting } = usePushSettingQuery();
  const { mutate: updatePushSetting } = usePushSettingMutation();

  const handleUpdateSetting = (updates: Partial<PushSetting>) => {
    if (!pushSetting) return;

    updatePushSetting({
      ...pushSetting,
      ...updates,
    });
  };

  const openTermsBottomSheet = () => {
    overlay.open(({ isOpen, close }) => <MarketingConsentSheet isOpen={isOpen} close={close} />);
  };

  return (
    <>
      <Header withSpacing={false}>
        <Header.BackButton />
        <Header.Title>알림 설정</Header.Title>
      </Header>

      <div className='px-4 pt-7 pb-4'>
        <h3 className='text-text-tertiary body2-semibold'>정보 알림</h3>
        <div className='flex items-center justify-between gap-2 py-4'>
          <div>
            <h4 className='h3-semibold text-text-primary mb-1'>앱 정보 푸시</h4>
            <span className='text-text-secondary body1-regular'>서비스 업데이트 등 알림</span>
          </div>
          <Switch
            key={`app-push-${pushSetting?.app_push}`}
            pressed={pushSetting?.app_push ?? false}
            onPressedChange={(checked) => {
              handleUpdateSetting({ app_push: checked });
            }}
          />
        </div>
      </div>

      <Divider size='thick' />

      <div className='px-4 py-7'>
        <h3 className='text-text-tertiary body2-semibold'>혜택 • 이벤트 및 기타 알림</h3>
        <div className='flex items-center justify-between gap-2 py-4'>
          <div>
            <button className='h3-semibold text-text-primary mb-1' onClick={openTermsBottomSheet}>
              마케팅 정보 수신동의
            </button>
            <span className='text-text-secondary label-semibold flex items-center gap-x-1'>
              <button type='button' onClick={() => push({ pathname: '/terms' })}>
                이용약관 보기
              </button>
              <Icon icon='ChevronRight' className='size-4' />
            </span>
          </div>
          <Switch
            key={`mkt-consent-${pushSetting?.mkt_consent}`}
            pressed={pushSetting?.mkt_consent ?? false}
            onPressedChange={(checked) => {
              handleUpdateSetting({ mkt_consent: checked });
            }}
          />
        </div>

        {/* Toggle On시 보이는 영역 */}
        {pushSetting?.mkt_consent && (
          <div>
            <Divider />
            <div className='flex justify-between py-4'>
              <span className='h3-semibold text-text-primary'>앱 푸시</span>
              <Switch
                key={`mkt-push-${pushSetting?.mkt_push}`}
                pressed={pushSetting?.mkt_push ?? false}
                onPressedChange={(checked) => {
                  handleUpdateSetting({ mkt_push: checked });
                }}
              />
            </div>
            <div className='flex justify-between py-4'>
              <span className='h3-semibold text-text-primary'>이메일</span>
              <Switch
                key={`mkt-email-${pushSetting?.mkt_email}`}
                pressed={pushSetting?.mkt_email ?? false}
                onPressedChange={(checked) => {
                  handleUpdateSetting({ mkt_email: checked });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export { AlarmSettingPage };
