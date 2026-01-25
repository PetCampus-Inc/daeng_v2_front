'use client';

import { FreeMemoSection } from '@features/memo';
import { CheckListSection } from '@features/checklist';
import { useUserStore } from '@entities/user';

interface MemoSectionProps {
  kindergartenId?: string;
}

function MemoSection({ kindergartenId }: MemoSectionProps) {
  const isLoggedIn = useUserStore((state) => !!state.user);

  if (!isLoggedIn) return null;

  return (
    <div className='mt-8 mb-12 flex flex-col gap-4 px-4'>
      <FreeMemoSection kindergartenId={kindergartenId} />
      <CheckListSection kindergartenId={kindergartenId} />
    </div>
  );
}

export { MemoSection };
