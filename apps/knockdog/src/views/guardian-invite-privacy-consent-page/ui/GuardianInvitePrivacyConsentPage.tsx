'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { ActionButton, Checkbox, ProgressBar, ScrollBar } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { SafeArea } from '@shared/ui/safe-area';

const privacyConsentPolicyBody = `회사는 보호자와 반려견의 유치원 연결 신청, 연결 승인 처리 및 유치원 생활 정보 제공을 위해 아래와 같이 개인정보를 수집·이용하며, 서비스 제공에 필요한 범위에서 해당 유치원의 원장 및 같은 유치원에 연결된 보호자에게 공개할 수 있습니다.

수집·이용 항목:
필수 : 보호자 정보(이름, 성별, 연락처, 주소), 반려견 정보(이름, 보호자와의 관계, 견종, 몸무게, 성별)
선택 : 보호자 비상연락처, 반려견 정보(나이, 중성화 여부, 사진)
연결 신청 정보: 신청 유치원, 신청 일시, 신청 상태, 승인/거절 처리 결과, 연결 상태
연결 후 생성 정보: 등하원 기록, 알림장, 사진 등 유치원 운영 기록

수집·이용 목적:
유치원 연결 신청 접수 및 승인 처리
연결 후 등하원, 알림장, 사진 공유 등 유치원 생활 정보 제공
보호자 응대, 비상 연락, 중복 신청 방지
문의 및 분쟁 대응

공개 대상:
연결 신청한 해당 유치원의 원장
같은 유치원에 연결된 보호자
단, 재원 기간 중 공용 앨범에 게시된 운영 기록에 한함

보유·이용 기간:
유치원 연결 종료 후 3년
단, 관련 법령 또는 내부 보관 기준에 따라 보관이 필요한 정보는 해당 기간 동안 보관

연결이 해제되면 해당 유치원은 신규 등하원 처리, 신규 알림장 작성, 신규 사진 등록을 할 수 없습니다. 다만 연결 해제 전 생성된 기존 운영 기록은 읽기 전용으로 보존될 수 있습니다.

동의를 거부할 권리가 있으나, 동의하지 않을 경우 유치원 연결 신청을 진행할 수 없어요.`;

/** 보호자 초대 3단계: 개인정보 수집 및 이용 동의 */
function GuardianInvitePrivacyConsentPage() {
  const { token } = useParams<{ token: string }>();
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <SafeArea edges={['bottom']} className='bg-bg-0 flex h-dvh flex-col' data-invite-token={token}>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
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
              onCheckedChange={setIsAgreed}
              className='border-line-200 flex h-x14 w-full cursor-pointer rounded-lg border bg-white px-x4 py-x4'
            >
              <span className={`body1-bold ${isAgreed ? 'text-text-primary' : 'text-[#70727C]'}`}>
                개인정보 수집·이용 및 제3자 제공 동의
              </span>
            </Checkbox>

            <ScrollBar
              className='h-[346px] rounded-lg bg-[#F9F9FA] px-x4 py-x3'
              viewportProps={{ 'aria-label': '개인정보 수집 및 이용 동의 내용' }}
            >
              <p className='body1-regular text-text-primary whitespace-pre-wrap'>{privacyConsentPolicyBody}</p>
            </ScrollBar>
          </div>
        </section>
      </main>

      <div className='bg-bg-0 px-x4 py-x5'>
        <ActionButton type='button' size='large' disabled={!isAgreed}>
          유치원 등록
        </ActionButton>
      </div>
    </SafeArea>
  );
}

export { GuardianInvitePrivacyConsentPage };
