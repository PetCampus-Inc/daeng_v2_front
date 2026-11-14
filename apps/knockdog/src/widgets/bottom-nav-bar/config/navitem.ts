export const GUARDIAN_NAV_ITEMS = [
  { href: '/', icon: 'MapNav' as const, label: '내 주변', iconClassName: 'size-[22px]' },
  { href: '/save', icon: 'ArchiveNav' as const, label: '보관함', iconClassName: 'size-[21px]' },
  { href: '/reservation', icon: 'ReserveNav' as const, label: '예약', iconClassName: 'size-[21px]' },
  { href: '/kindergarten', icon: 'LogNav' as const, label: '똑독로그' },
  { href: '/mypage', icon: 'MyNav' as const, label: '마이', iconClassName: 'size-[21px]' },
];

export const OWNER_NAV_ITEMS = [
  { href: '/owner', icon: 'OwnerNav' as const, label: '홈', iconClassName: 'size-[21px]' },
  { href: '/owner/daily', icon: 'DailyNav' as const, label: '일과', iconClassName: 'size-5' },
  { href: '/owner/album', icon: 'AlbumNav' as const, label: '앨범', iconClassName: 'size-5' },
  { href: '/owner/members', icon: 'MembersNav' as const, label: '구성원', iconClassName: 'size-[21px]' },
  { href: '/mypage', icon: 'MypageNav' as const, label: '마이', iconClassName: 'size-[21px]' },
];
