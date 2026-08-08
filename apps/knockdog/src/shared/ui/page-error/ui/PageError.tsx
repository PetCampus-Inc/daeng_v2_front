'use client';

import Image from 'next/image';
import { ActionButton } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

interface PageErrorProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

function PageError({
  title = '정보를 불러오지 못했어요',
  description = '잠시 후 다시 시도해 주세요.',
  retryLabel = '다시 시도하기',
  onRetry,
  isRetrying = false,
  className,
}: PageErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }

    window.location.reload();
  };

  return (
    <div className={cn('bg-bg-0 fixed inset-0 z-100 mx-auto flex h-dvh w-full max-w-120 flex-col', className)}>
      <main className='flex min-h-0 flex-1 flex-col items-center pt-[202px]'>
        <div className='flex h-[296px] w-full flex-col items-center gap-10'>
          <Image
            src='/images/img_404.png'
            alt=''
            aria-hidden='true'
            width={200}
            height={200}
            priority
          />
          <div className='flex h-14 w-full flex-col items-center gap-1 text-center'>
            <h1 className='h2-extrabold text-text-primary'>{title}</h1>
            <p className='body1-regular text-text-primary'>{description}</p>
          </div>
        </div>
      </main>
      <div className='flex h-24 w-full items-center gap-2 px-4 py-5'>
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

export { PageError, type PageErrorProps };
