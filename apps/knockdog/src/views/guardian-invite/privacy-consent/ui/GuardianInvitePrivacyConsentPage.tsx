'use client';

import { ActionButton, Checkbox, ProgressBar, ScrollBar } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { SafeArea } from '@shared/ui/safe-area';

import { useGuardianInvitePrivacyConsentPage } from '../model/useGuardianInvitePrivacyConsentPage';
import { privacyConsentPolicyClosing, privacyConsentPolicyIntro, privacyConsentPolicySections } from '../config/privacyConsentPolicyBody';

/** 보호자 초대 3단계: 개인정보 수집 및 이용 동의 */
function GuardianInvitePrivacyConsentPage() {
  const { handleAgreedChange, handleBack, handleSubmit, isAgreed, isSubmitEnabled } = useGuardianInvitePrivacyConsentPage();

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton onClick={() => void handleBack()} />
        </Header.LeftSection>
        <Header.Title>개인정보 수집 및 이용 동의</Header.Title>
      </Header>

      <div className='shrink-0 px-x4 py-x2'>
        <ProgressBar totalSteps={3} value={3} className='h-1.5' />
      </div>

      <main className='min-h-0 flex-1 overflow-y-auto py-x5'>
        <section className='flex flex-col px-x4'>
          <h1 className='h2-extrabold text-text-primary'>
            개인정보 수집·이용 및
            <br />
            유치원 제공에 동의해 주세요
          </h1>

          <div className='flex flex-col gap-y-2 py-x4'>
            <Checkbox
              size='sm'
              checked={isAgreed}
              onCheckedChange={handleAgreedChange}
              className='border-line-200 radius-r2 flex h-x14 w-full cursor-pointer border bg-bg-0 px-x4 py-x4'
            >
              <span className={`body1-bold ${isAgreed ? 'text-text-primary' : 'text-text-secondary'}`}>
                개인정보 수집·이용 및 제3자 제공 동의
              </span>
            </Checkbox>

            <ScrollBar
              className='radius-r2 h-[346px] bg-fill-secondary-50'
              viewportProps={{ 'aria-label': '개인정보 수집 및 이용 동의 내용' }}
            >
              <div className='body1-regular text-text-primary'>
                <p>{privacyConsentPolicyIntro}</p>

                <div className='mt-[24px]'>
                  {privacyConsentPolicySections.map((section) => (
                    <section key={section.title} className='mb-[24px]'>
                      <h2>{section.title}</h2>
                      <ul className='list-disc pl-x5'>
                        {section.items.map((item) => (
                          <li key={item.text}>
                            {item.text}
                            {item.note ? <p>{item.note}</p> : null}
                            {item.nestedItem ? (
                              <ul className='list-[circle] pl-x5'>
                                <li>{item.nestedItem}</li>
                              </ul>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}

                  {privacyConsentPolicyClosing.map((paragraph, index) => (
                    <p key={paragraph} className={index < privacyConsentPolicyClosing.length - 1 ? 'mb-[24px]' : undefined}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </ScrollBar>
          </div>
        </section>
      </main>

      <div className='bg-bg-0 px-x4 py-x5'>
        <ActionButton
          type='button'
          size='large'
          disabled={!isSubmitEnabled}
          onClick={() => void handleSubmit()}
        >
          유치원 등록
        </ActionButton>
      </div>
    </SafeArea>
  );
}

export { GuardianInvitePrivacyConsentPage };
