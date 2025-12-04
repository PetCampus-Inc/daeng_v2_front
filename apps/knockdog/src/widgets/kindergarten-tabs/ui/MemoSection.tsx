import { FreeMemoSection } from '@features/memo';
import { CheckListSection } from '@features/checklist';

function MemoSection() {
  return (
    <div className='mt-8 mb-12 flex flex-col gap-4 px-4'>
      <FreeMemoSection />
      <CheckListSection />
    </div>
  );
}

export { MemoSection };
