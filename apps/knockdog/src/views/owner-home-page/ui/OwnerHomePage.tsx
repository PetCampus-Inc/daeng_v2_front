'use client';

import Image from 'next/image';
import { Icon } from '@knockdog/ui';
import { Header } from '@widgets/Header';

function OwnerHomePage() {
  const enrolledCount = 1;
  const hasSentNoticebook = true;

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
        <Header>
          <Header.Title className='flex items-center'>
            <Image src='/images/img_logo_text2.png' alt='똑독' width={48} height={26} priority />
          </Header.Title>
        </Header>
      </div>

      <div className='bg-bg-0 flex h-14 w-full items-center justify-between p-4'>
        <div className='gap-x1 flex h-6 items-center'>
          <span className='flex size-6 shrink-0 items-center justify-center'>
            <Icon icon='AlertFill' className='text-fill-primary-500 size-6' />
          </span>
          <div className='gap-x0_5 flex h-5 items-center'>
            <span className='body2-bold text-text-primary whitespace-nowrap'>연결 승인 대기</span>
            <span className='body2-extrabold text-text-accent whitespace-nowrap'>3건</span>
          </div>
        </div>
        <button type='button' className='flex size-6 shrink-0 items-center justify-center' aria-label='닫기'>
          <Icon icon='Close' className='text-fill-secondary-700 size-6' />
        </button>
      </div>

      <section className={`flex ${enrolledCount > 0 ? 'h-[433px]' : 'h-[393px]'} w-full flex-col gap-5 py-5`}>
        <div className='flex h-[52px] w-full items-center justify-between gap-5 px-4'>
          <div className='flex min-w-0 flex-1 gap-1'>
            <p className='h3-extrabold text-text-primary min-w-0 w-fit'>
              안녕하세요
              <br />
              <span className='text-text-accent'>모모네 유치원</span> 원장님
            </p>
            <div className='flex h-12 w-6 shrink-0 items-center justify-center pt-6'>
              <Icon icon='Kindergarten' className='text-fill-secondary-700 size-6 shrink-0' />
            </div>
          </div>
          <button
            type='button'
            className='bg-bg-100 radius-full flex size-9 shrink-0 items-center justify-center p-1.5'
            aria-label='새로고침'
          >
            <Icon icon='Reset' className='text-fill-secondary-700 size-6' />
          </button>
        </div>
        <div className={`${enrolledCount > 0 ? 'h-[249px]' : 'h-[209px]'} w-full px-4`}>
          <div className='radius-r3 h-full w-full overflow-hidden'>
            <div className='bg-fill-primary-500 h-14 px-4'>
              <div className='radius-r3 flex h-14 w-full items-center justify-between py-4'>
                <div className='gap-x0_5 flex h-6 w-fit min-w-0 items-center'>
                  <span className='body1-extrabold text-text-primary-inverse'>6월 18일</span>
                  <span className='body1-extrabold text-text-primary-inverse'>(화)</span>
                </div>
                <div className='gap-x1 flex h-[18px] w-fit min-w-0 items-center'>
                  <span className='text-size-caption1 text-text-primary-inverse leading-[18px] font-regular tracking-normal'>
                    오후 8:00
                  </span>
                </div>
              </div>
            </div>
            <div className={`bg-bg-0 flex ${enrolledCount > 0 ? 'h-[193px]' : 'h-[153px]'} flex-col gap-4 p-4`}>
              <div className='flex h-[68px] w-full items-center justify-between'>
                <div className='flex h-[68px] min-w-0 flex-col gap-2'>
                  <div className='gap-x0_5 flex h-5 w-fit min-w-0 items-center'>
                    <span className='body2-semibold text-text-primary'>재원 중</span>
                  </div>
                  <div className='flex h-10 w-fit min-w-0 items-center gap-4'>
                    <span className='text-text-primary text-[40px] leading-none font-extrabold tracking-normal'>
                      {enrolledCount}
                    </span>
                  </div>
                </div>
                <div className='flex h-[50px] min-w-0 items-center gap-4'>
                  <div className='flex h-[50px] min-w-0 flex-col gap-2'>
                    <span className='text-text-secondary text-size-caption1 leading-[18px] font-semibold tracking-normal'>
                      오늘 등원
                    </span>
                    <span className='text-text-primary text-[24px] leading-none font-extrabold tracking-normal'>12</span>
                  </div>
                  <div className='flex h-[50px] min-w-0 flex-col gap-2'>
                    <span className='text-text-secondary text-size-caption1 leading-[18px] font-semibold tracking-normal'>
                      오늘 하원
                    </span>
                    <span className='text-text-primary text-[24px] leading-none font-extrabold tracking-normal'>12</span>
                  </div>
                </div>
              </div>
              <div className='bg-line-200 h-px w-full' />
              {enrolledCount > 0 ? (
                <div className='flex h-[60px] w-full items-start justify-between'>
                  <div className='flex h-[60px] w-[172px] min-w-0 flex-col gap-2'>
                    <span className='body2-regular text-text-secondary flex h-5 items-center text-center'>
                      지금 함께하는 친구들
                    </span>
                    <div className='flex h-8 w-[172px] items-center'>
                      <div className='border-bg-0 size-8 rounded-full border-2 bg-fill-secondary-100' />
                      <div className='border-bg-0 -ml-2 size-8 rounded-full border-2 bg-fill-secondary-100' />
                      <div className='border-bg-0 -ml-2 size-8 rounded-full border-2 bg-fill-secondary-100' />
                      <div className='border-bg-0 -ml-2 size-8 rounded-full border-2 bg-fill-secondary-100' />
                      <div className='border-bg-0 -ml-2 size-8 rounded-full border-2 bg-fill-secondary-100' />
                      <div className='border-bg-0 bg-fill-secondary-200 -ml-2 flex size-8 items-center justify-center rounded-full border-2'>
                        <span className='text-size-caption1 text-text-secondary leading-[18px] font-regular tracking-normal'>
                          +3
                        </span>
                      </div>
                    </div>
                  </div>
                  <button type='button' className='flex h-[26px] items-center gap-x-1 rounded px-2 py-1'>
                    <span className='text-size-caption1 text-text-tertiary leading-[18px] font-semibold tracking-normal'>
                      전체보기
                    </span>
                    <Icon icon='ChevronRight' className='text-fill-secondary-400 size-4' />
                  </button>
                </div>
              ) : (
                <div className='flex h-5 w-full items-center gap-[41px]'>
                  <span className='body2-regular text-text-secondary'>함께하는 친구가 없어요</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {hasSentNoticebook ? (
          <div className='radius-r3 border-line-accent bg-bg-0 mx-4 flex h-[52px] items-center justify-between border px-4 py-[10px]'>
            <div className='flex h-8 w-fit min-w-0 items-center gap-2'>
              <span className='radius-full bg-fill-primary-50 flex size-8 shrink-0 items-center justify-center p-2'>
                <Icon icon='Checklist' className='text-fill-primary-500 size-4' />
              </span>
              <div className='gap-x1 flex h-5 w-fit min-w-0 items-center'>
                <span className='body2-semibold text-text-primary whitespace-nowrap'>발송 전 알림장</span>
                <div className='flex h-5 min-w-0 items-center'>
                  <span className='body2-extrabold text-text-accent whitespace-nowrap'>7건</span>
                  <span className='body2-semibold text-text-primary whitespace-nowrap'>이 있어요</span>
                </div>
              </div>
            </div>
            <Icon icon='ChevronRight' className='text-fill-primary-500 size-6 shrink-0' />
          </div>
        ) : (
          <div className='radius-r3 bg-bg-100 mx-4 flex h-[52px] items-center gap-2 p-4'>
            <span className='flex size-4 shrink-0 items-center justify-center'>
              <Icon icon='Checklist' className='text-fill-secondary-400 size-4' />
            </span>
            <div className='gap-x1 flex h-5 w-fit min-w-0 items-center'>
              <span className='body2-semibold text-text-secondary whitespace-nowrap'>오늘</span>
              <div className='flex h-5 min-w-0 items-center'>
                <span className='body2-extrabold text-text-primary whitespace-nowrap'>12건</span>
                <span className='body2-semibold text-text-secondary whitespace-nowrap'>의 알림장을 모두 발송했어요</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export { OwnerHomePage };
