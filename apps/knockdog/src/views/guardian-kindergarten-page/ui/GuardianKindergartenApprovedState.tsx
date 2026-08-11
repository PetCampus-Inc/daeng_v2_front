'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ActionButton, Icon } from '@knockdog/ui';

import { guardianKindergartenApprovedContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenApprovedContent';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';
import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

import { GuardianKindergartenDateCalendar } from './GuardianKindergartenDateCalendar';
import { GuardianLinkedKindergartenCard } from './GuardianLinkedKindergartenCard';

interface GuardianKindergartenApprovedStateProps {
  kindergarten: GuardianLinkedKindergarten;
  attendanceRecordDateKeys?: Set<string>;
}

function GuardianKindergartenApprovedState({
  kindergarten,
  attendanceRecordDateKeys,
}: GuardianKindergartenApprovedStateProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const content = guardianKindergartenApprovedContent;
  const { push } = useStackNavigation();

  const handleHistoryClick = () => {
    push({ pathname: route.compare.connectionHistory.root });
  };

  const handleAlbumPreviousClick = () => {
    push({ pathname: route.compare.album.root });
  };

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col gap-10 py-5'>
        {/* 일일 소식 */}
        <section className='flex w-full flex-col gap-3'>
          <div className='gap-x2 flex items-center'>
            <Icon icon='Paw' className='text-fill-secondary-400 size-6' aria-hidden='true' />
            <p className='h3-extrabold text-text-primary'>{formatKoreanDateWithWeekday(selectedDate)}</p>
          </div>
          <div className='bg-bg-50 radius-r3 flex h-16 w-full items-center justify-center px-4'>
            <p className='body2-bold text-text-secondary'>{content.dailyEmptyMessage}</p>
          </div>
        </section>

        {/* 오늘의 앨범 */}
        <section className='flex w-full flex-col items-center gap-5'>
          <div className='flex w-full items-center'>
            <p className='h3-extrabold text-text-primary'>{content.albumTitle}</p>
          </div>
          <div className='relative size-[200px] shrink-0'>
            <Image
              src={content.albumEmptyImageSrc}
              alt={content.albumEmptyImageAlt}
              fill
              className='object-contain'
              sizes='200px'
              priority
            />
          </div>
          <div className='flex w-[174px] flex-col items-center gap-4'>
            <p className='body1-bold text-text-primary text-center'>{content.albumEmptyTitle}</p>
            <ActionButton
              type='button'
              variant='primaryLine'
              size='medium'
              className='w-auto'
              onClick={handleAlbumPreviousClick}
            >
              {content.albumPreviousLabel}
              <Icon icon='ChevronRight' className='text-text-accent size-5' />
            </ActionButton>
          </div>
        </section>
      </div>

      {/* 주간 캘린더 */}
      <section className='flex w-full flex-col items-center'>
        <GuardianKindergartenDateCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          markedDateKeys={attendanceRecordDateKeys}
        />
        <div className='flex w-full flex-col items-center p-4'>
          <p className='body1-medium text-text-tertiary text-center'>{content.calendarEmptyMessage}</p>
        </div>
      </section>

      {/* 유치원 카드 + 이력 */}
      <section className='px-x4 mt-6 flex w-full flex-col items-center gap-3 pb-5'>
        <GuardianLinkedKindergartenCard kindergarten={kindergarten} />
        <button
          type='button'
          className='gap-x1 flex items-center justify-center rounded px-2 py-1'
          onClick={handleHistoryClick}
        >
          <span className='label-semibold text-text-tertiary'>{content.historyLabel}</span>
          <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
        </button>
      </section>
    </div>
  );
}

export { GuardianKindergartenApprovedState };
