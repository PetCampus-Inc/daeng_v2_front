'use client';

import { useState, type ReactNode } from 'react';

import { ActionButton } from '@knockdog/ui';

import {
  ActionLoadingOverlay,
  DelayedLoadingSpinner,
  InfiniteScrollFooter,
  LoadingSpinner,
  LOADING_SPINNER_DELAY_MS,
  ACTION_LOADING_DELAY_MS,
  RingLoadingSpinner,
} from '@shared/ui/loading-spinner';

function PreviewSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className='border-line-200 flex flex-col gap-3 rounded-xl border p-4'>
      <div>
        <h2 className='body1-bold text-text-primary'>{title}</h2>
        {description ? <p className='body2-regular text-text-secondary mt-1'>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function LoadingPreviewPage() {
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [isAppendLoading, setIsAppendLoading] = useState(false);

  const handleSimulateAction = () => {
    setIsActionPending(true);
    window.setTimeout(() => setIsActionPending(false), 2000);
  };

  const handleSimulateAppend = () => {
    setIsAppendLoading(true);
    window.setTimeout(() => setIsAppendLoading(false), 2000);
  };

  return (
    <div className='bg-bg-50 mx-auto min-h-dvh max-w-120 p-4 pb-10'>
      <h1 className='h2-extrabold text-text-primary mb-2'>Loading Spinner Preview</h1>
      <p className='body2-regular text-text-secondary mb-6'>
        dev 전용 · `/test/loading` · 페이지 {LOADING_SPINNER_DELAY_MS}ms / 액션 {ACTION_LOADING_DELAY_MS}ms 지연
      </p>

      <div className='flex flex-col gap-4'>
        <PreviewSection title='LoadingSpinner (공통 Lottie)' description='layout: inline / content / screen'>
          <div className='bg-bg-0 flex h-24 items-center justify-center rounded-lg'>
            <LoadingSpinner layout='inline' />
          </div>
          <div className='bg-bg-0 flex h-40 rounded-lg'>
            <LoadingSpinner layout='content' />
          </div>
        </PreviewSection>

        <PreviewSection
          title='DelayedLoadingSpinner (페이지 진입)'
          description={`${LOADING_SPINNER_DELAY_MS}ms 후 노출 · Header 유지 + content 영역 예시`}
        >
          <div className='bg-bg-0 overflow-hidden rounded-lg'>
            <div className='border-line-100 border-b px-4 py-3'>
              <p className='body1-bold text-text-primary'>Header (유지)</p>
            </div>
            <div className='relative flex h-48'>
              <DelayedLoadingSpinner isLoading={isPageLoading} layout='content' />
            </div>
          </div>
          <ActionButton type='button' variant='secondaryLine' size='medium' onClick={() => setIsPageLoading((prev) => !prev)}>
            {isPageLoading ? '로딩 끄기' : '로딩 켜기 (275ms 후 스피너)'}
          </ActionButton>
        </PreviewSection>

        <PreviewSection title='RingLoadingSpinner (업로드 전용)'>
          <div className='bg-dim-70 flex h-32 items-center justify-center rounded-lg'>
            <RingLoadingSpinner />
          </div>
        </PreviewSection>

        <PreviewSection title='ActionLoadingOverlay (액션)' description={`${ACTION_LOADING_DELAY_MS}ms 후 반투명 오버레이 + 공통 스피너`}>
          <div className='bg-bg-0 relative flex h-40 flex-col items-center justify-center gap-3 rounded-lg'>
            <ActionLoadingOverlay isPending={isActionPending} />
            <p className='body1-regular text-text-secondary'>버튼 누르면 2초간 pending</p>
            <ActionButton type='button' variant='primaryFill' size='medium' disabled={isActionPending} onClick={handleSimulateAction}>
              저장 시뮬레이션
            </ActionButton>
          </div>
        </PreviewSection>

        <PreviewSection title='InfiniteScrollFooter (리스트 append)' description='지연 없이 즉시 노출'>
          <div className='bg-bg-0 rounded-lg px-4 py-3'>
            <p className='body2-regular text-text-secondary mb-2'>…기존 리스트…</p>
            <InfiniteScrollFooter hasNextPage isFetchingNextPage={isAppendLoading} />
          </div>
          <ActionButton type='button' variant='secondaryLine' size='medium' onClick={handleSimulateAppend}>
            추가 조회 시뮬레이션 (2초)
          </ActionButton>
        </PreviewSection>
      </div>
    </div>
  );
}

export default LoadingPreviewPage;
