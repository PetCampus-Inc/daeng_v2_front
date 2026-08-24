'use client';

import Image from 'next/image';
import { ActionButton } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

/**
 * overlay: 헤더까지 덮는 전면 오류 화면
 * inline: 헤더를 남기고 본문 영역만 채우는 오류 화면
 */
type PageErrorLayout = 'overlay' | 'inline';

interface PageErrorProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  layout?: PageErrorLayout;
  className?: string;
}

const layoutStyle: Record<PageErrorLayout, { root: string; main: string; footer: string }> = {
  overlay: {
    root: 'bg-bg-0 fixed inset-0 z-100 mx-auto flex h-dvh w-full max-w-120 flex-col',
    main: 'flex min-h-0 flex-1 flex-col items-center pt-[202px]',
    footer: 'flex w-full items-center gap-2 px-4 pt-5 pb-[calc(1.25rem+var(--safe-area-inset-bottom,0px))]',
  },
  inline: {
    root: 'bg-bg-0 flex min-h-0 w-full flex-1 flex-col',
    main: 'flex min-h-0 flex-1 flex-col items-center justify-center px-4',
    footer: 'shrink-0 px-4 pt-5 pb-[calc(1.25rem+var(--safe-area-inset-bottom,0px))]',
  },
};

function PageError({
  title = '정보를 불러오지 못했어요',
  description = '잠시 후 다시 시도해 주세요.',
  retryLabel = '다시 시도하기',
  onRetry,
  isRetrying = false,
  layout = 'overlay',
  className,
}: PageErrorProps) {
  const style = layoutStyle[layout];

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }

    window.location.reload();
  };

  return (
    <div className={cn(style.root, className)}>
      <main className={style.main}>
        <div className='flex w-full flex-col items-center gap-0'>
          <div className='relative size-[200px] shrink-0'>
            <Image
              src='/images/img_404.webp'
              alt=''
              aria-hidden='true'
              fill
              className='object-contain'
              sizes='200px'
              priority
            />
          </div>
          <div className='flex w-full flex-col items-center gap-1 text-center'>
            <h1 className='h2-extrabold text-text-primary'>{title}</h1>
            <p className='body1-regular text-text-primary'>{description}</p>
          </div>
        </div>
      </main>
      <div className={style.footer}>
        <ActionButton
          type='button'
          variant='primaryFill'
          size='large'
          disabled={isRetrying}
          onClick={handleRetry}
        >
          {retryLabel}
        </ActionButton>
      </div>
    </div>
  );
}

export { PageError, type PageErrorProps, type PageErrorLayout };
