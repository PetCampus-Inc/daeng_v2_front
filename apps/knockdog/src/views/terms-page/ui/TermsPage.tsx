'use client';

import { Icon } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';

const TERMS_URLS = [
  {
    title: '서비스 이용약관',
    href: route.terms.service.root,
  },
  {
    title: '개인정보 처리방침',
    href: route.terms.privacy.root,
  },
  {
    title: '위치기반서비스 이용약관',
    href: route.terms.location.root,
  },
];

function TermsPage() {
  const { push } = useStackNavigation();

  return (
    <div className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
      <Header className='h-[66px] shrink-0'>
        <Header.BackButton />
        <Header.Title>이용약관</Header.Title>
      </Header>

      <main>
        {TERMS_URLS.map((term) => (
          <button
            key={term.title}
            type='button'
            className='flex h-[66px] w-full items-center justify-between px-4 text-left'
            onClick={() => push({ pathname: term.href })}
          >
            <span className='h3-medium text-text-primary'>{term.title}</span>
            <Icon icon='ChevronRight' className='text-text-primary size-6' />
          </button>
        ))}
      </main>
    </div>
  );
}

export { TermsPage };
