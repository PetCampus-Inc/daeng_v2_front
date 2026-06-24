'use client';

import { Checkbox } from '@knockdog/ui';

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
    <div className='flex flex-col gap-3'>
      <div className='border-line-200 rounded-2xl border bg-white px-4 py-3'>
        <Checkbox size='sm' checked={checked} onCheckedChange={onCheckedChange}>
          <span className='body1-bold text-text-primary'>{label}</span>
        </Checkbox>
      </div>

      <div className='bg-fill-secondary-50 max-h-[280px] overflow-y-auto rounded-2xl px-4 py-4'>
        <p className='body1-regular text-text-primary whitespace-pre-wrap'>{policyBody}</p>
      </div>
    </div>
  );
}

export { InlineAgreementConsent };
