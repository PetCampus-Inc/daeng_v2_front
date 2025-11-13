'use client';

import { Header } from '@widgets/Header';
import { Divider, Icon } from '@knockdog/ui';
import { useOpenExternalLink } from '@shared/lib/bridge';

const TERMS_URLS = [
  {
    title: '개인(위치)정보 처리방침',
    url: 'https://www.notion.so/2086c15f67fb80fda893c0d69410d2ec?source=copy_link',
  },
  {
    title: '서비스 이용약관',
    url: 'https://www.notion.so/2086c15f67fb80bf8702c6a7e1974737?source=copy_link',
  },
  {
    title: '위치기반서비스 이용약관',
    url: 'https://www.notion.so/2086c15f67fb80c68b65f4197df8cb59?source=copy_link',
  },
];

function TermsPage() {
  const openExternalLink = useOpenExternalLink();

  return (
    <>
      <Header withSpacing={false}>
        <Header.BackButton />
        <Header.Title>이용약관</Header.Title>
      </Header>

      <div className='px-4 py-7'>
        <h3 className='text-text-tertiary text-sm font-medium'>약관 내용</h3>
        <div className='py-2'>
          {TERMS_URLS.map((term, index) => (
            <div key={term.title}>
              <div className='flex justify-between py-4' onClick={() => openExternalLink(term.url)}>
                <span className='h3-semibold'>{term.title}</span>
                <Icon icon='ChevronRight' />
              </div>
              {index !== TERMS_URLS.length - 1 && <Divider className='my-2' />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export { TermsPage };
