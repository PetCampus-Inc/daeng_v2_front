import { ChevronLeft, Close, More } from '@knockdog/icons';

import { cn } from '@knockdog/ui/lib';

const DIARY_TOP_BAR_MODE = {
  menu: 'menu',
  plain: 'plain',
  edit: 'edit',
  editing: 'editing',
} as const;

type DiaryTopBarMode = keyof typeof DIARY_TOP_BAR_MODE;

interface DiaryTopBarProps {
  mode?: DiaryTopBarMode;
  title?: string;
  className?: string;
  onBack?: () => void;
  onClose?: () => void;
  onMenu?: () => void;
  onComplete?: () => void;
}

/** V4 / Dog Diary / Top Navigation */
function DiaryTopBar({ mode = 'menu', title, className, onBack, onClose, onMenu, onComplete }: DiaryTopBarProps) {
  const isEditing = mode === 'edit' || mode === 'editing';
  const label = title ?? (isEditing ? '일기 수정' : '일기장');

  return (
    <header className={cn('border-line-100 bg-bg-0 flex h-[66px] w-full items-center justify-between border-b px-x4', className)}>
      <div className='gap-x1 flex min-w-0 flex-1 items-center'>
        <button type='button' aria-label={isEditing ? '닫기' : '뒤로'} onClick={isEditing ? onClose : onBack} className='inline-flex'>
          {isEditing ? <Close className='text-text-primary' /> : <ChevronLeft className='text-text-primary' />}
        </button>
        <h1 className='h2-extrabold text-text-primary'>{label}</h1>
      </div>
      {mode === 'menu' ? (
        <button type='button' aria-label='더보기' onClick={onMenu} className='inline-flex'>
          <More className='text-text-primary' />
        </button>
      ) : null}
      {isEditing ? (
        <button
          type='button'
          disabled={mode === 'edit'}
          onClick={onComplete}
          className={cn('body1-bold disabled:opacity-100', mode === 'editing' ? 'text-text-accent' : 'text-text-caption')}
        >
          완료
        </button>
      ) : null}
    </header>
  );
}

export { DiaryTopBar, DIARY_TOP_BAR_MODE };
export type { DiaryTopBarMode, DiaryTopBarProps };
