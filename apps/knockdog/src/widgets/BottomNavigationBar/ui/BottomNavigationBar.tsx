import Link from 'next/link';

export function BottomNavigationBar() {
  return (
    <div className='flex w-full border-t border-t-[#F3F3F7] px-4 text-center shadow-[0px_-2px_12px_0px_rgba(0,0,0,0.05)]'>
      <div className='flex h-[68px] flex-1 flex-col items-center justify-center gap-y-1'>
        <Link href='/search'>
          <div className='size-6 bg-black'></div>
          <span className='text-[12px]'>탐색</span>
        </Link>
      </div>
      <div className='flex h-[68px] flex-1 flex-col items-center justify-center gap-y-1'>
        <Link href='/save'>
          <div className='size-6 bg-black'></div>
          <span className='text-[12px]'>저장</span>
        </Link>
      </div>
      <div className='flex h-[68px] flex-1 flex-col items-center justify-center gap-y-1'>
        <Link href='/compare'>
          <div className='size-6 bg-black'>⋮</div>
          <span className='text-[12px]'>비교</span>
        </Link>
      </div>
      <div className='flex h-[68px] flex-1 flex-col items-center justify-center gap-y-1'>
        <Link href='/my'>
          <div className='size-6 bg-black'></div>
          <span className='text-[12px]'>마이</span>
        </Link>
      </div>
    </div>
  );
}
