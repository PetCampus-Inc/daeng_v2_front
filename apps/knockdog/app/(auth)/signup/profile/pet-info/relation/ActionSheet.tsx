import { BottomSheet, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useState } from 'react';

interface ActionSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const RELATION_OPTIONS = [
  { label: '엄마', value: 'mother' },
  { label: '아빠', value: 'father' },
  { label: '가족', value: 'family' },
  { label: '보호자', value: 'guardian' },
  { label: '기타', value: 'etc' },
];

export default function ActionSheet({
  isOpen,
  onOpenChange,
}: ActionSheetProps) {
  const [relation, setRelation] = useState<string>('mother');

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Content>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-200 justify-between border-b'>
          <BottomSheet.Title>관계 선택</BottomSheet.Title>
          <BottomSheet.Close className='absolute right-4 flex items-center justify-center'>
            <Icon icon='Close' />
          </BottomSheet.Close>
        </BottomSheet.Header>
        <div className='px-6'>
          {RELATION_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={cn(
                'body2-semibold flex cursor-pointer items-center justify-between py-4',
                relation === option.value && 'text-text-accent'
              )}
              onClick={() => setRelation(option.value)}
            >
              <label
                className='flex cursor-pointer items-center gap-x-2'
                htmlFor={option.value}
              >
                {option.label}
              </label>
              <input
                type='radio'
                name='relation'
                value={option.value}
                checked={relation === option.value}
                onChange={() => setRelation(option.value)}
                id={option.value}
                className='sr-only'
              />
              <span
                className={cn(
                  'relative m-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-neutral-400 transition-colors',
                  relation === option.value && 'border-text-accent'
                )}
              >
                {relation === option.value && (
                  <span className='bg-text-accent block h-3 w-3 rounded-full' />
                )}
              </span>
            </div>
          ))}
        </div>
      </BottomSheet.Content>
    </BottomSheet.Root>
  );
}
