'use client';

import dynamic from 'next/dynamic';

import { MypageSectionSkeleton } from '@views/mypage/ui/MypageSectionSkeleton';

const AccountSection = dynamic(
  () => import('@features/user-account').then((mod) => ({ default: mod.AccountSection })),
  { loading: () => <MypageSectionSkeleton rows={5} /> }
);

const QuickActionsSection = dynamic(
  () => import('@features/support').then((mod) => ({ default: mod.QuickActionsSection })),
  { loading: () => <MypageSectionSkeleton rows={2} /> }
);

const SettingsSection = dynamic(
  () => import('@features/app-settings').then((mod) => ({ default: mod.SettingsSection })),
  { loading: () => <MypageSectionSkeleton rows={4} /> }
);

const DogHouseSection = dynamic(
  () => import('@features/dog-profile').then((mod) => ({ default: mod.DogHouseSection })),
  { loading: () => <MypageSectionSkeleton rows={3} /> }
);

export { AccountSection, QuickActionsSection, SettingsSection, DogHouseSection };
