export const GUARDIAN_NAV_ITEMS = [
  { href: '/', icon: 'SearchNav' as const, label: '내 주변' },
  { href: '/save', icon: 'SaveNav' as const, label: '보관함' },
  { href: '/compare', icon: 'KindergartenNav' as const, label: '유치원' },
  { href: '/mypage', icon: 'MypageFill' as const, label: '마이' },
];

export const OWNER_NAV_ITEMS = [
  { href: '/owner', icon: 'OwnerNav' as const, label: '홈', iconClassName: 'size-[21px]' },
  { href: '/owner/daily', icon: 'DailyNav' as const, label: '일과', iconClassName: 'size-5' },
  { href: '/owner/album', icon: 'AlbumNav' as const, label: '앨범', iconClassName: 'size-5' },
  { href: '/owner/members', icon: 'MembersNav' as const, label: '구성원', iconClassName: 'size-[21px]' },
  { href: '/mypage', icon: 'MypageNav' as const, label: '마이', iconClassName: 'size-[21px]' },
];
