'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { overlay } from 'overlay-kit';
import { noticePreviews } from '@views/notice-page/config/noticePreviews';
import { NoticeImageViewer } from '@views/notice-page/ui/NoticeImageViewer';

import { Header } from '@widgets/Header';
import { EXTERNAL_LINKS } from '@shared/constants';
import { useOpenExternalLink } from '@shared/lib/bridge';

const termsLinks = [
  { label: '서비스 이용약관(2026. 09. 01. 개정)', url: EXTERNAL_LINKS.TERMS_OF_SERVICE },
  { label: '개인정보 처리방침(2026. 09. 01. 개정)', url: EXTERNAL_LINKS.PRIVACY_POLICY },
  { label: '위치기반서비스 이용약관(2026. 09. 01. 개정)', url: EXTERNAL_LINKS.LOCATION_BASED_SERVICE_TERMS },
];
const exampleImageSrc = '/images/review-mock/1.jpg';

function NoticeImagePlaceholder({ label }: { label: string }) {
  return (
    <div className='bg-bg-100 flex h-[439px] w-full items-center justify-center p-5' role='img' aria-label={label}>
      <Image src='/images/ico_gallery_not.svg' width={48} height={48} alt='' />
    </div>
  );
}

function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const notice = noticePreviews.find((item) => item.id === id);
  const openExternalLink = useOpenExternalLink();
  const [isExampleImageError, setIsExampleImageError] = useState(false);

  const handleImageClick = () => {
    overlay.open(({ isOpen, close }) => <NoticeImageViewer isOpen={isOpen} close={close} src={exampleImageSrc} />);
  };

  return (
    <div className='bg-bg-0 flex min-h-0 flex-1 flex-col overflow-hidden'>
      <Header className='h-[66px] shrink-0'>
        <Header.BackButton aria-label='뒤로가기' />
        <Header.Title>공지사항</Header.Title>
      </Header>

      <main className='min-h-0 flex-1 overflow-y-auto'>
        {notice ? (
          <article className='flex flex-col gap-5 px-4 py-5'>
            <div className='flex flex-col gap-2'>
              <h1 className='h2-extrabold text-text-primary'>{notice.title}</h1>
              <p className='body2-semibold text-text-secondary'>{notice.date}</p>
            </div>

            <p className='body1-regular text-text-primary whitespace-pre-line'>
              {'안녕하세요, 똑독 팀입니다.\n\n똑독 3.0 업데이트로 유치원과 보호자가 연결되는 새로운 기능을 선보여요.'}
            </p>

            {isExampleImageError ? (
              <NoticeImagePlaceholder label='첫 번째 공지사항 이미지 없음' />
            ) : (
              <button
                type='button'
                onClick={handleImageClick}
                aria-label='첫 번째 공지사항 이미지 확대 보기'
                className='block w-full overflow-hidden'
              >
                <Image
                  src={exampleImageSrc}
                  alt='유치원에서 함께 있는 강아지들'
                  width={960}
                  height={640}
                  sizes='(max-width: 390px) calc(100vw - 32px), 358px'
                  className='h-auto w-full'
                  onError={() => setIsExampleImageError(true)}
                />
              </button>
            )}
            <NoticeImagePlaceholder label='두 번째 공지사항 이미지 없음' />

            <div className='body1-regular text-text-primary flex flex-col gap-6'>
              <p>
                이제 유치원을 찾고 비교하는 것을 넘어, 강아지의 유치원 생활을 똑독에서 함께 관리하고 확인할 수 있어요.
              </p>
              <p>
                원장님은 원생 관리부터 등하원, 알림장과 사진까지 유치원의 하루를 한곳에서 편리하게 관리할 수 있어요.
                <br />
                보호자님은 따로 문의하지 않아도 강아지의 등하원과 유치원 생활을 확인하며 안심할 수 있어요.
              </p>
              <p>새로운 기능 제공에 따라 2026년 9월 1일부터 개정된 약관과 개인정보 처리방침이 적용돼요.</p>
              <div>
                <p>자세한 내용은 아래 링크에서 확인해 주세요.</p>
                <div className='mt-6 flex flex-col items-start'>
                  {termsLinks.map((link) => (
                    <button
                      key={link.label}
                      type='button'
                      className='text-left underline underline-offset-2'
                      onClick={() => openExternalLink(link.url)}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
              <p>다음 업데이트로는 이용권을 통해 예약할 수 있는 기능을 준비하고 있어요.</p>
              <p>
                앞으로도 똑독은 유치원 운영의 부담을 줄여 원장님이 원생 돌봄에 더 집중할 수 있도록 도울게요.
                <br />
                감사합니다.
              </p>
              <p>똑독 팀 드림</p>
            </div>
          </article>
        ) : (
          <p className='body1-regular text-text-secondary px-4 py-5'>공지사항을 찾을 수 없어요.</p>
        )}
      </main>
    </div>
  );
}

export { NoticeDetailPage };
