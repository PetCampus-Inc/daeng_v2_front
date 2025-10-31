import { Icon } from '@knockdog/ui';
import { USER_ADDRESS_TYPE_KR, UserAddressType } from '@entities/user';

interface LocationFieldProps {
  type: UserAddressType;
  required?: boolean;
  onAdd?: () => void;
}

export function LocationField({ type, required, onAdd }: LocationFieldProps) {
  return (
    <div className='flex flex-col gap-y-2 py-5'>
      {/* 라벨 */}
      <div className='flex items-center gap-x-px'>
        <span className='h3-extrabold'>{USER_ADDRESS_TYPE_KR[type]}</span>

        {required ? (
          <span className='body1-extrabold text-text-accent'>*</span>
        ) : (
          <span className='body1-medium text-text-secondary'>(선택)</span>
        )}
      </div>

      {/* 추가 버튼 */}
      <button>
        <div className='text-text-tertiary body1-bold flex items-center gap-x-1'>
          <Icon icon='Plus' className='h-5 w-5' />
          추가하기
        </div>
      </button>
    </div>
  );
}
