import { Icon } from '@knockdog/ui';

export function CurrentLocationDisplayFAB() {
  return (
    <button className='px-x3.5 py-x2 radius-full gap-x1 bg-fill-secondary-700 text-text-primary-inverse label-semibold flex h-[34px] cursor-pointer items-center shadow-[0_0_4px_0] shadow-black/16'>
      <Icon icon='Location' className='size-x4_5' />
      강남구 논현동
    </button>
  );
}
