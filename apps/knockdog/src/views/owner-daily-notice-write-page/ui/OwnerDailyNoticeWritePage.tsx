'use client';

import { Icon } from '@knockdog/ui';

import { Header } from '@widgets/Header';

/**
 * 원장 일과 탭 — 원생별 알림장 작성 페이지 (배경 레이아웃)
 * 폼/텍스트 등 내부 요소는 이후 단계에서 추가
 */
function OwnerDailyNoticeWritePage() {
  return (
    <div
      className='flex h-dvh flex-col'
      style={{
        background:
          'linear-gradient(180deg, var(--color-primitive-orange-400) 0%, var(--color-primitive-orange-500) 42.54%)',
      }}
    >
      <div className='relative overflow-hidden pt-(--safe-area-inset-top,0px)'>
        <Icon
          icon='Paw'
          aria-hidden='true'
          className='text-primitive-orange-300 pointer-events-none absolute top-0 -right-[72px] size-[240px] -rotate-30 opacity-20'
        />

        <Header variant='transparent'>
          <Header.LeftSection>
            <Header.BackButton className='text-text-primary-inverse' />
          </Header.LeftSection>
        </Header>

        {/* 프로필 헤더 영역 placeholder (아바타·이름 등 이후 배치) */}
        <div className='h-[140px]' aria-hidden />
      </div>

      <div className='bg-bg-0 relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px]'>
        {/* 알림장 폼 영역 (이후 구현) */}
      </div>
    </div>
  );
}

export { OwnerDailyNoticeWritePage };
