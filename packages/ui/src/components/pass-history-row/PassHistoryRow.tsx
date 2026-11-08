import { type ReactNode } from 'react';

import { cn } from '@knockdog/ui/lib';

const PASS_HISTORY = {
  use: 'use',
  canceled: 'canceled',
  period: 'period',
  charged: 'charged',
  extension: 'extension',
} as const;

type PassHistoryKind = keyof typeof PASS_HISTORY;

const PASS_HISTORY_COPY = {
  use: { title: '사용', amount: '7회', description: '2026.10.30 (목) 등원 예약' },
  canceled: { title: '사용', amount: '7회', description: '예약을 취소했어요' },
  period: { title: '홀딩', amount: '-', description: '2026.11.25에 홀딩이 종료돼요' },
  charged: { title: '10회 충전', amount: '10회', description: '이용권이 10회 충전됐어요' },
  extension: { title: '이용기간 연장', amount: '-', description: '2027.12.31까지 사용할 수 있어요' },
} as const;

interface PassHistoryRowProps {
  kind?: PassHistoryKind;
  title?: ReactNode;
  amount?: ReactNode;
  description?: ReactNode;
  className?: string;
}

/** V4 / Pass History Row */
function PassHistoryRow({ kind = 'use', title, amount, description, className }: PassHistoryRowProps) {
  const copy = PASS_HISTORY_COPY[kind];
  const isCanceled = kind === 'canceled';

  return (
    <div className={cn('py-x2_5 gap-x1 flex w-full flex-col items-start', className)}>
      <div className='flex w-full items-center justify-between'>
        <p className={cn('body1-bold', isCanceled ? 'text-text-caption line-through' : 'text-text-primary')}>
          {title ?? copy.title}
        </p>
        <p className={cn('body1-extrabold', isCanceled ? 'text-text-caption line-through' : 'text-text-primary')}>
          {amount ?? copy.amount}
        </p>
      </div>
      <p className='label-medium text-fill-secondary-500'>{description ?? copy.description}</p>
    </div>
  );
}

export { PassHistoryRow, PASS_HISTORY };
export type { PassHistoryKind, PassHistoryRowProps };
