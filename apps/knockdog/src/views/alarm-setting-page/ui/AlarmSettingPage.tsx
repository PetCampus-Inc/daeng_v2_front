'use client';

import { useState } from 'react';
import { Header } from '@widgets/Header';
import { Divider, Icon, Switch } from '@knockdog/ui';
import { MarketingConsentSheet } from '@features/marketing-consent';
import { overlay } from 'overlay-kit';

function AlarmSettingPage() {
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isMarketingEnabled, setIsMarketingEnabled] = useState(false);

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
          <Switch pressed={isPushEnabled} onPressedChange={setIsPushEnabled} />
        </div>
      </div>

      <Divider size='thick' />

      <div className='px-4 py-7'>
        <h3 className='text-text-tertiary body2-semibold'>혜택 • 이벤트 및 기타 알림</h3>
        <div className='flex items-center justify-between gap-2 py-4'>
          <div>
            <h4 className='h3-semibold text-text-primary mb-1'>마케팅 정보 수신동의</h4>
            <span className='text-text-secondary label-semibold flex items-center gap-x-1'>
              <button type='button' onClick={openTermsBottomSheet}>
                이용약관 보기
              </button>
              <Icon icon='ChevronRight' className='size-4' />
            </span>
          </div>
          <Switch pressed={isMarketingEnabled} onPressedChange={setIsMarketingEnabled} />
        </div>

        {/* Toggle On시 보이는 영역 */}
        {isMarketingEnabled && (
          <div>
            <Divider />
            <div className='flex justify-between py-4'>
              <span className='h3-semibold text-text-primary'>앱 푸시</span>
              <Switch />
            </div>
            <div className='flex justify-between py-4'>
              <span className='h3-semibold text-text-primary'>이메일</span>
              <Switch />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export { AlarmSettingPage };
