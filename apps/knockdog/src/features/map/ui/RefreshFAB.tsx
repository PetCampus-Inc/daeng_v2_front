import { Icon } from '@knockdog/ui';

interface RefreshFABProps {
  onClick?: () => void;
}

export function RefreshFAB({ onClick }: RefreshFABProps) {
  return (
    <button
      onClick={onClick}
      className='px-x3.5 py-x2 radius-full gap-x1 bg-fill-secondary-700 text-text-primary-inverse label-semibold flex h-[34px] cursor-pointer items-center shadow-[0_0_4px_0] shadow-black/16'
    >
      <Icon icon='Reset' className='size-x4_5' />현 지도에서 검색
    </button>
  );
}
