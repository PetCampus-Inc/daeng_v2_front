'use client';

import { usePathname } from 'next/navigation';
import { COMPANY_SLUG_PATHNAME } from '@constants/pathname';
import { Header } from './Header';
import { useHeaderContext } from '../model/HeaderProvider';

export function HeaderWrapper() {
  const pathname = usePathname();
  const { variant, title } = useHeaderContext();

  const companyBasePath = COMPANY_SLUG_PATHNAME.replace(/\[.*?\]/g, '');
  if (pathname.startsWith(companyBasePath)) {
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

  const isAccountLinking = pathname.startsWith('/account-linking');
  if (isAccountLinking) {
    return (
      <Header variant={variant}>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.CenterSection>
          <Header.Title>기존 회원 로그인</Header.Title>
        </Header.CenterSection>
      </Header>
    );
  }

  return null;
}
