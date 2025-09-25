'use client';

import { usePathname } from 'next/navigation';
import { COMPANY_SLUG_PATHNAME } from '@constants/pathname';
import { Header } from './Header';
import { useHeaderContext } from '../model/HeaderProvider';

export function HeaderWrapper() {
  const pathname = usePathname();
  const { variant, title } = useHeaderContext();

  // pathname이 null인 경우 헤더를 표시하지 않음
  if (!pathname) {
    return null;
  }

  const companyBasePath = COMPANY_SLUG_PATHNAME.replace(/\[.*?\]/g, '');
  const isCompanyPath = pathname.startsWith(companyBasePath);
  const isFullImagePath = pathname.includes('/full-image');

  const isAccountLinking = pathname.startsWith('/account-linking');
  if (isAccountLinking) {
    return (
      <Header variant={variant}>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.CenterSection>
          <Header.Title>{title}</Header.Title>
        </Header.CenterSection>
      </Header>
    );
  }

  const isSignupComplete = pathname.startsWith('/signup/complete');
  if (isSignupComplete) {
    return null;
  }

  const isSignupPetDetailsSteps = pathname.startsWith('/signup/pet-details');
  if (isSignupPetDetailsSteps) {
    return (
      <Header variant={variant} className='border-line-100 border-b'>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>

        <Header.Title>{title}</Header.Title>

        <Header.RightSection>
          <button className='label-semibold text-text-primary'>건너뛰기</button>
        </Header.RightSection>
      </Header>
    );
  }

  const isSignupPage = pathname.startsWith('/signup');
  if (isSignupPage) {
    return (
      <Header variant={variant} className='border-line-100 border-b'>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.CenterSection>
          <Header.Title>{title}</Header.Title>
        </Header.CenterSection>
      </Header>
    );
  }
  return null;
}
