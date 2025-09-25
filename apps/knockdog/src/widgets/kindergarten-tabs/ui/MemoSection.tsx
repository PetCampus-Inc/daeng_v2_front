import { FreeMemoSection } from '@features/memo';
import { CheckListSection } from '@features/checklist';

function MemoSection() {
  return (
    <div className='mb-12 mt-8 flex flex-col gap-4 px-4'>
      <FreeMemoSection />
      <CheckListSection />
    </div>
  );
}

export { MemoSection };
