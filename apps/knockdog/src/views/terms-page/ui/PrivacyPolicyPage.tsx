'use client';

import { useEffect, useRef, useState } from 'react';

import { Divider, Icon } from '@knockdog/ui';
import { Header } from '@widgets/Header';

const policyVersions = [
  { label: '2026. 11. 01. 시행', badge: '예정', available: false },
  { label: '2026. 09. 01. 시행', badge: '현행', available: true },
  { label: '2026. 08. 01. 시행', badge: null, available: false },
  { label: '2026. 07. 25. 시행', badge: null, available: false },
] as const;

function TermVersionBadge({ label }: { label: '예정' | '현행' }) {
  return (
    <span
      className={`caption1-semibold radius-full flex h-5 w-[37px] shrink-0 items-center justify-center px-2 leading-[18px] ${label === '현행' ? 'bg-info-light text-info' : 'bg-bg-50 text-primitive-neutral-500'}`}
    >
      {label}
    </span>
  );
}

function TermsDetailPage({ title }: { title: string }) {
  const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);
  const versionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVersionMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !versionMenuRef.current?.contains(event.target)) {
        setIsVersionMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsVersionMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVersionMenuOpen]);

  return (
    <div className='bg-bg-0 flex min-h-0 flex-1 flex-col overflow-hidden'>
      <Header className='h-[66px] shrink-0 border-b-0'>
        <Header.BackButton aria-label='뒤로가기' />
        <Header.Title>{title}</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto px-4'>
        <div ref={versionMenuRef} className='relative mt-2 mb-2'>
          <button
            type='button'
            className='border-line-200 radius-r2 flex h-10 w-full items-center justify-between border px-4'
            aria-expanded={isVersionMenuOpen}
            aria-controls='privacy-policy-versions'
            onClick={() => setIsVersionMenuOpen((open) => !open)}
          >
            <span className='flex items-center gap-1'>
              <span className='body2-regular text-text-primary'>2026. 09. 01. 시행</span>
              <TermVersionBadge label='현행' />
            </span>
            <Icon
              icon={isVersionMenuOpen ? 'ChevronTop' : 'ChevronBottom'}
              className='text-text-tertiary size-5'
              aria-hidden='true'
            />
          </button>
          {isVersionMenuOpen ? (
            <div
              id='privacy-policy-versions'
              className='border-line-200 bg-bg-0 radius-r2 absolute top-full left-0 z-20 flex h-[168px] w-[175px] flex-col border px-3 py-3'
            >
              {policyVersions.map((version, index) => (
                <button
                  key={`${version.label}-${index}`}
                  type='button'
                  aria-label={version.label}
                  disabled={!version.available}
                  className='flex h-9 shrink-0 items-center gap-1 text-left disabled:cursor-not-allowed'
                  onClick={() => setIsVersionMenuOpen(false)}
                >
                  <span
                    className={`body2-regular w-[110px] shrink-0 whitespace-nowrap ${version.available ? 'text-text-primary' : 'text-text-secondary'}`}
                  >
                    {version.label}
                  </span>
                  {version.badge ? <TermVersionBadge label={version.badge} /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className='body2-regular text-text-primary flex flex-col gap-5 py-5'>
          <section className='flex flex-col gap-3'>
            <h1 className='body2-bold'>똑독 개인정보처리방침</h1>
            <p>
              펫캠퍼스 주식회사(이하 “회사”)는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「개인정보 보호법」,
              「통신비밀보호법」, 「전기통신사업법」 및 「전자상거래 등에서의 소비자 보호에 관한 법률」 등 관련 법령에서
              요구하는 개인정보 보호 규정을 성실히 준수하며, 이용자의 개인정보 보호를 최우선으로 생각합니다.
            </p>
            <p>
              회사는 관련 법령에 따라 본 개인정보처리방침을 제정하고, 똑독 서비스를 이용하는 일반 사용자(이하
              “이용자”)의 개인정보가 안전하게 보호될 수 있도록 최선을 다하겠습니다.
            </p>
            <p>
              회사는 이용자의 개인정보를 아래에 명시한 수집 및 이용 목적 범위 내에서만 이용하며, 사전 동의 없이 해당
              범위를 초과하여 처리하거나 제3자에게 제공하거나 위탁하지 않습니다. 단, 다음의 경우는 예외로 합니다.
            </p>
            <div>
              <p>이용자가 사전에 명시적으로 동의한 경우</p>
              <p>
                (예: 이용자가 똑독 서비스 이용과 관련하여 자발적으로 특정 정보를 제3자에게 제공하거나 공유하는 것에
                명시적으로 동의한 경우)
              </p>
              <p>관련 법령에 따라 수사기관 등 공공기관이 정해진 절차와 방법에 따라 요청한 경우</p>
            </div>
            <div>
              <p>위와 같은 경우에도 회사는 다음 사항을 사전에 고지하고 이용자의 명시적이고 개별적인 동의를 받습니다.</p>
              <p className='mt-3'>
                개인정보를 제공받는 자<br />
                개인정보의 이용 목적
                <br />
                개인정보의 보유 및 이용 기간
              </p>
            </div>
            <p>
              회사는 어떠한 경우에도 이용자의 의사에 반하여 추가적인 개인정보를 수집하거나, 동의한 범위를 초과하여
              개인정보를 외부에 공유하지 않습니다.
            </p>
          </section>

          <div className='bg-bg-50 radius-r4 p-3'>
            <table className='w-full table-fixed text-left'>
              <thead>
                <tr>
                  <th scope='col' className='body2-bold pr-2 pb-2 align-top'>
                    수탁업체
                  </th>
                  <th scope='col' className='body2-bold pr-2 pb-2 align-top'>
                    위탁업무 내용
                  </th>
                  <th scope='col' className='body2-bold pb-2 align-top'>
                    개인정보 보유 및 이용기간
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='pr-2 pb-2 align-top'>Amazon Web Services, Inc.</td>
                  <td className='pr-2 pb-2 align-top'>서비스 인프라 운영 및 데이터 저장 (클라우드 서버)</td>
                  <td className='pb-2 align-top'>회원 탈퇴 시 또는 위탁계약 종료 시까지</td>
                </tr>
                <tr>
                  <td className='pr-2 align-top'>Notion Labs, Inc.</td>
                  <td className='pr-2 align-top'>고객 문의 접수, 문의 내용 및 처리 이력 관리</td>
                  <td className='align-top'>문의 처리 완료 후 관련 법령 또는 내부 보관 기준에 따른 기간까지</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Divider />

          <section className='flex flex-col gap-3'>
            <h2 className='body2-bold'>고지의 의무</h2>
            <p>
              이 개인정보처리방침은 2026년 8월 22일에 게시되었으며, 관련 법령이나 내부 정책 변경에 따라 수정될 수
              있습니다. 변경 시 사전에 앱 내 공지사항 또는 팝업 등을 통해 고지하며, 중대한 변경의 경우 최소 7일 전부터
              사전 안내합니다.
            </p>
            <p>
              공고일자: 2026년 8월 22일
              <br />
              시행일자: 2026년 9월 1일
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function PrivacyPolicyPage() {
  return <TermsDetailPage title='개인정보 처리방침' />;
}

export { PrivacyPolicyPage, TermsDetailPage };
