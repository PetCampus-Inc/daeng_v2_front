import Link from 'next/link';
import { Icon } from '@knockdog/ui';

export function BottomNavigationBar() {
  return (
    <div className='flex w-full border-t border-t-[#F3F3F7] px-4 text-center shadow-[0px_-2px_12px_0px_rgba(0,0,0,0.05)]'>
      <nav className='flex h-[68px] flex-1 flex-col items-center justify-center gap-y-1'>
        <Link href='/search'>
          <div className='size-6'>
            <Icon icon='SearchNav' />
          </div>
          <span className='text-[12px]'>탐색</span>
        </Link>
      </nav>
      <nav className='flex h-[68px] flex-1 flex-col items-center justify-center gap-y-1'>
        <Link href='/save'>
          <div className='size-6'>
            <Icon icon='SaveNav' />
          </div>
          <span className='text-[12px]'>저장</span>
        </Link>
      </nav>
      <nav className='flex h-[68px] flex-1 flex-col items-center justify-center gap-y-1'>
        <Link href='/compare'>
          <div className='size-6'>
            <Icon icon='CompareNav' />
          </div>
          <span className='text-[12px]'>비교</span>
        </Link>
      </nav>
      <nav className='flex h-[68px] flex-1 flex-col items-center justify-center gap-y-1'>
        <Link href='/my'>
          <div className='size-6'>
            <Icon icon='MypageNav' />
          </div>
          <span className='text-[12px]'>마이</span>
        </Link>
      </nav>
    </div>
  );
}
