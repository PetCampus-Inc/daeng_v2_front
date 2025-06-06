'use client';

import { usePathname } from 'next/navigation';
import { COMPANY_SLUG_PATHNAME } from '@constants/pathname';
import { Header } from './Header';
import { useHeaderContext } from '@widgets/Header/model/HeaderProvider';

export default function HeaderWrapper() {
  const pathname = usePathname();
  const { variant, title } = useHeaderContext();

  if (pathname.startsWith(COMPANY_SLUG_PATHNAME.split('[')[0]!)) {
    return (
      <Header variant={variant}>
        <Header.LeftSection>
          <Header.BackButton />
          <Header.HomeButton />
        </Header.LeftSection>

        <Header.Title>{title}</Header.Title>

        <Header.RightSection>
          <Header.ShareButton />
          <Header.MenuButton />
        </Header.RightSection>
      </Header>
    );
  }

  return null;
}
