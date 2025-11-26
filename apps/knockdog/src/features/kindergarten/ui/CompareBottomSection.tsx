'use client';

import { ActionButton } from '@knockdog/ui';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useCompareStore } from '@shared/store/useCompareStore';

export default function CompareBottomSection() {
  const router = useRouter();
  const { items, remove, clear } = useCompareStore();

  const canCompare = items.length === 2;
  const qs = useMemo(() => items.map((v) => `ids=${encodeURIComponent(v.id)}`).join('&'), [items]);

  if (items.length === 0) return null;

  return (
    <div className='border-line-100 bg-fill-secondary-0 rounded-2xl border p-12'>
      {/* 선택 카드들 */}
      <div className='mb-12 grid grid-cols-2 gap-12'>
        {items.map((v) => (
          <div key={v.id} className='border-line-100 relative overflow-hidden rounded-xl border'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {v.thumb ? (
              <img src={v.thumb} alt='' className='aspect-[5/3] w-full object-cover' />
            ) : (
              <div className='bg-fill-secondary-50 aspect-[5/3] w-full' />
            )}
            <button
              className='absolute top-6 right-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-black/60 text-white'
              onClick={() => remove(v.id)}
              aria-label='선택 해제'
            >
              ×
            </button>
            <div className='px-10 py-8 text-sm font-semibold'>{v.title}</div>
          </div>
        ))}
        {items.length === 1 && (
          <div className='border-line-300 text-text-tertiary flex items-center justify-center rounded-xl border border-dashed'>
            + 다른 유치원 선택
          </div>
        )}
      </div>

      <div className='flex items-center justify-between gap-8'>
        <ActionButton size='medium' variant='secondaryLine' onClick={clear}>
          닫기
        </ActionButton>
        <ActionButton
          size='medium'
          variant={canCompare ? 'primaryFill' : 'secondaryFill'}
          disabled={!canCompare}
          onClick={() => {
            if (!canCompare) return;
            const url = `/compare-complete?${qs}`;
            clear();
            router.push(url);
          }}
        >
          비교하기 {items.length}/2
        </ActionButton>
      </div>
    </div>
  );
}
