import { Field, FieldContent } from '@knockdog/ui';

import type { KindergartenInfoDisplayItem } from '../model/kindergartenInfo';

interface KindergartenInfoSummaryProps {
  items: KindergartenInfoDisplayItem[];
}

function KindergartenInfoSummary({ items }: KindergartenInfoSummaryProps) {
  return (
    <div className='bg-fill-secondary-50 flex flex-col rounded-2xl p-4'>
      <div className='flex flex-col gap-3'>
        {items.map((item) => (
          <Field key={item.label} className='flex-col gap-0'>
            <FieldContent className='gap-0'>
              <span className='body1-regular text-text-secondary'>{item.label}</span>
              <span className='h3-semibold text-text-primary'>{item.value}</span>
            </FieldContent>
          </Field>
        ))}
      </div>
    </div>
  );
}

export { KindergartenInfoSummary };
