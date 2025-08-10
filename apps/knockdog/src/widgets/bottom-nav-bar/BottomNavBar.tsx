import Link from 'next/link';
import { Icon } from '@knockdog/ui';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';

export function BottomNavBar() {
  return (
    <div className='fixed inset-x-0 bottom-0 z-99'>
      <div
        style={{ height: `${BOTTOM_BAR_HEIGHT}px` }}
        className='border-t-line-100 bg-bg-0 flex w-full border-t px-4 text-center shadow-[0px_-2px_12px_0px_rgba(0,0,0,0.05)]'
      >
        <nav className={`flex flex-1 flex-col items-center justify-center gap-y-1`}>
          <Link href='/search'>
            <div className='size-6'>
              <Icon icon='SearchNav' />
            </div>
            <span className='caption1-extrabold text-fill-secondary-700'>탐색</span>
          </Link>
        </nav>
        <nav className={`flex flex-1 flex-col items-center justify-center gap-y-1`}>
          <Link href='/save'>
            <div className='size-6'>
              <Icon icon='SaveNav' />
            </div>
            <span className='caption1-extrabold text-fill-secondary-700'>저장</span>
          </Link>
        </nav>
        <nav className={`flex flex-1 flex-col items-center justify-center gap-y-1`}>
          <Link href='/compare'>
            <div className='size-6'>
              <Icon icon='CompareNav' />
            </div>
            <span className='caption1-extrabold text-fill-secondary-700'>비교</span>
          </Link>
        </nav>
        <nav className={`flex flex-1 flex-col items-center justify-center gap-y-1`}>
          <Link href='/my'>
            <div className='size-6'>
              <Icon icon='MypageNav' />
            </div>
            <span className='caption1-extrabold text-fill-secondary-700'>마이</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
