'use client';

import { noticePreviews } from '@views/notice-page/config/noticePreviews';
import { Header } from '@widgets/Header';
import { useStackNavigation } from '@shared/lib/bridge';
import { route } from '@shared/constants/route';

function NoticePage() {
  const { push } = useStackNavigation();

  return (
    <div className='bg-bg-50 flex min-h-0 flex-1 flex-col overflow-hidden'>
      <Header className='h-[66px] shrink-0'>
        <Header.BackButton aria-label='뒤로가기' />
        <Header.Title>공지사항</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto' aria-label='공지사항 목록'>
        <ul>
          {noticePreviews.map((notice) => (
            <li key={notice.id} className='border-line-200 bg-bg-0 border-b'>
              <button
                type='button'
                className='flex w-full flex-col gap-1 px-4 py-4 text-left'
                onClick={() => push({ pathname: route.mypage.notice.detail.root.replace('[id]', notice.id) })}
              >
                <span className='body1-bold text-text-primary line-clamp-2'>{notice.title}</span>
                <span className='body2-regular text-text-secondary'>{notice.date}</span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export { NoticePage };
