type GuardianTabName = 'Explore' | 'Save' | 'Compare' | 'Mypage';
type OwnerTabName = 'OwnerHome' | 'OwnerDaily' | 'OwnerAlbum' | 'OwnerMembers' | 'Mypage';
type TabName = GuardianTabName | OwnerTabName;

const OWNER_ONLY_TABS = new Set<TabName>(['OwnerHome', 'OwnerDaily', 'OwnerAlbum', 'OwnerMembers']);
const GUARDIAN_ONLY_TABS = new Set<TabName>(['Explore', 'Save', 'Compare']);

function pathToTab(pathname: string): TabName | null {
  const normalizedPath = pathname === '' ? '/' : pathname;

  switch (normalizedPath) {
    case '/':
    case '/home':
    case '/search':
      return 'Explore';
    case '/save':
      return 'Save';
    case '/compare':
      return 'Compare';
    case '/mypage':
      return 'Mypage';
    case '/owner':
      return 'OwnerHome';
    case '/owner/daily':
      return 'OwnerDaily';
    case '/owner/album':
      return 'OwnerAlbum';
    case '/owner/members':
      return 'OwnerMembers';
    default:
      return null;
  }
}

function isOwnerOnlyTab(tabName: TabName) {
  return OWNER_ONLY_TABS.has(tabName);
}

function isGuardianOnlyTab(tabName: TabName) {
  return GUARDIAN_ONLY_TABS.has(tabName);
}

function modeForTab(tabName: TabName): 'owner' | 'guardian' | null {
  if (isOwnerOnlyTab(tabName)) return 'owner';
  if (isGuardianOnlyTab(tabName)) return 'guardian';
  return null;
}

export { pathToTab, isOwnerOnlyTab, isGuardianOnlyTab, modeForTab };
export type { TabName, GuardianTabName, OwnerTabName };
