'use client';

import { Checkbox, ScrollBar } from '@knockdog/ui';

interface InlineAgreementConsentProps {
  label: string;
  policyBody: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function InlineAgreementConsent({
  label,
  policyBody,
  checked,
  onCheckedChange,
}: InlineAgreementConsentProps) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='border-line-200 radius-r2 border bg-white px-x4 py-x4'>
        <Checkbox size='sm' checked={checked} onCheckedChange={onCheckedChange}>
          <span className='body1-bold text-text-primary'>{label}</span>
        </Checkbox>
      </div>

      <ScrollBar className='bg-fill-secondary-50 radius-r2 h-[346px]'>
        <p className='body1-regular text-text-primary whitespace-pre-wrap'>{policyBody}</p>
      </ScrollBar>
    </div>
  );
}

export { InlineAgreementConsent };
