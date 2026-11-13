import { Close, Paw } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

interface DiaryImportBannerProps {
  dogName?: string;
  className?: string;
  onImport?: () => void;
  onDismiss?: () => void;
}

/** V4 / Dog Diary / Diary Banner */
function DiaryImportBanner({ dogName = '강아지', className, onImport, onDismiss }: DiaryImportBannerProps) {
  return (
    <section className={cn('border-line-400 bg-bg-50 radius-r3 relative flex w-full flex-col gap-x3 border border-dashed px-x5 py-x4', className)}>
      <button type='button' aria-label='닫기' onClick={onDismiss} className='absolute top-[12px] right-[14px] inline-flex size-x6 items-center justify-center'>
        <Close className='text-fill-secondary-500' />
      </button>
      <div className='gap-x1_5 pr-x8 flex w-full flex-col'>
        <h2 className='h3-semibold text-text-primary'>오늘의 알림장을 불러올까요?</h2>
        <p className='body2-regular text-fill-secondary-500'>AI가 오늘의 알림장을 읽고 {dogName}의 일기를 써줘요.</p>
      </div>
      <div className='flex w-full justify-end'>
        <button
          type='button'
          onClick={onImport}
          className='border-line-accent text-text-accent body2-bold bg-bg-0 gap-x1_5 px-x5 py-x3 inline-flex items-center rounded-[10px] border'
        >
          <Paw className='text-text-accent size-x4_5' />
          불러오기
        </button>
      </div>
    </section>
  );
}

export { DiaryImportBanner };
export type { DiaryImportBannerProps };
