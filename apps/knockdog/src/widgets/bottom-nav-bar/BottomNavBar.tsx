import Link from 'next/link';
import { Icon } from '@knockdog/ui';
import { BOTTOM_BAR_HEIGHT } from '@shared/constants';

const NAV_ITEMS = [
  { href: '/search', icon: 'SearchNav' as const, label: '탐색' },
  { href: '/save', icon: 'SaveNav' as const, label: '저장' },
  { href: '/compare', icon: 'CompareNav' as const, label: '비교' },
  { href: '/my', icon: 'MypageNav' as const, label: '마이' },
];

export function BottomNavBar() {
  return (
    <div className='z-99 fixed inset-x-0 bottom-0'>
      <div
        style={{ height: `${BOTTOM_BAR_HEIGHT}px` }}
        className='border-t-line-100 bg-bg-0 flex w-full border-t px-4 text-center shadow-[0px_-2px_12px_0px_rgba(0,0,0,0.05)]'
      >
        <nav className='flex w-full'>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className='flex flex-1 flex-col items-center justify-center gap-y-1'>
              <div className='size-6'>
                <Icon icon={item.icon} />
              </div>
              <span className='caption1-extrabold text-fill-secondary-700'>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
