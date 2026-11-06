import { cn } from '@knockdog/ui/lib';

/** 문의·아이디어 제안의 사용자 유형. 두 API 모두 같은 값을 쓴다 */
type SupportUserType = 'GUARDIAN' | 'OWNER';

const USER_TYPE_OPTIONS: { value: SupportUserType; label: string }[] = [
  { value: 'GUARDIAN', label: '보호자' },
  { value: 'OWNER', label: '원장' },
];

interface SupportUserTypeFieldProps {
  value: SupportUserType | null;
  onChange: (value: SupportUserType | null) => void;
}

/** 문의·아이디어 제안의 사용자 유형 단일 선택. 선택된 항목을 다시 누르면 선택 해제 */
function SupportUserTypeField({ value, onChange }: SupportUserTypeFieldProps) {
  return (
    <div className='gap-x2 px-x4 py-x3 flex flex-col'>
      <p className='gap-x0_5 body2-bold text-text-primary flex'>
        사용자 유형<span className='text-text-accent'>*</span>
      </p>
      <div className='gap-x2 flex'>
        {USER_TYPE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            // Figma 높이 36px: 테두리가 크기에 더해지지 않도록 안쪽 ring으로 그린다
            <button
              key={option.value}
              type='button'
              aria-pressed={isSelected}
              onClick={() => onChange(isSelected ? null : option.value)}
              className={cn(
                'body2-regular radius-full px-x3 py-x2 ring-1 ring-inset',
                isSelected
                  ? 'bg-fill-primary-50 ring-line-accent text-primitive-orange-600'
                  : 'bg-bg-0 ring-line-200 text-text-secondary'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { SupportUserTypeField };
export type { SupportUserType };
