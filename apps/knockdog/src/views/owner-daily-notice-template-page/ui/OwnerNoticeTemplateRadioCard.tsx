'use client';

import { RadioGroupItem } from '@knockdog/ui';

import type { OwnerNoticeTemplate } from '@entities/owner-notice-template';

interface OwnerNoticeTemplateRadioCardProps {
  template: OwnerNoticeTemplate;
}

function OwnerNoticeTemplateRadioCard({ template }: OwnerNoticeTemplateRadioCardProps) {
  return (
    <label
      htmlFor={template.id}
      className='bg-bg-0 border-line-200 radius-r3 flex w-full cursor-pointer flex-col border p-4'
    >
      <div className='flex items-start gap-2 opacity-80'>
        <div className='flex shrink-0 items-center p-[3px] [&>div]:space-x-0'>
          <RadioGroupItem value={template.id} id={template.id} />
        </div>

        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <p className='body1-bold text-text-primary line-clamp-1'>{template.title}</p>
          <p className='body2-regular text-text-primary line-clamp-2'>{template.content}</p>
        </div>
      </div>
    </label>
  );
}

export { OwnerNoticeTemplateRadioCard };
