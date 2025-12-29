import { Icon } from '@knockdog/ui';

interface CurrentLocationDisplayProps {
  address: string | null;
}

export function CurrentLocationDisplay({ address }: CurrentLocationDisplayProps) {
  return (
    <button className='px-x3.5 py-x2 radius-full gap-x1 bg-fill-secondary-700 text-text-primary-inverse label-semibold flex h-[34px] cursor-pointer items-center shadow-[0_0_4px_0] shadow-black/16'>
      <Icon icon='LocationFill' className='size-x4_5' />
      {address ?? '위치 정보 없음'}
    </button>
  );
}
