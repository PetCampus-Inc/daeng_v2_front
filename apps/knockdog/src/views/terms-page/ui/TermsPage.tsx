'use client';

import { Divider, Icon } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { useOpenExternalLink } from '@shared/lib/bridge';
import { EXTERNAL_LINKS } from '@shared/constants';

const TERMS_URLS = [
  {
    title: '개인정보 처리방침',
    url: EXTERNAL_LINKS.PRIVACY_POLICY,
  },
  {
    title: '서비스 이용약관',
    url: EXTERNAL_LINKS.TERMS_OF_SERVICE,
  },
  {
    title: '위치 기반 서비스 이용약관',
    url: EXTERNAL_LINKS.LOCATION_BASED_SERVICE_TERMS,
  },
];

function TermsPage() {
  const openExternalLink = useOpenExternalLink();

  return (
    <>
      <Header>
        <Header.BackButton />
        <Header.Title>이용약관</Header.Title>
      </Header>

      <div className='px-4 py-5'>
        <h3 className='text-text-tertiary text-sm font-medium'>약관</h3>
        <div className='pt-2'>
          {TERMS_URLS.map((term, index) => (
            <div key={term.title}>
              <button
                type='button'
                className='flex w-full items-center justify-between rounded-lg px-2 py-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100'
                onClick={() => openExternalLink(term.url)}
              >
                <span className='body1-medium text-text-primary'>{term.title}</span>
                <Icon icon='ChevronRight' />
              </button>
              {index !== TERMS_URLS.length - 1 && <Divider className='' />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export { TermsPage };
