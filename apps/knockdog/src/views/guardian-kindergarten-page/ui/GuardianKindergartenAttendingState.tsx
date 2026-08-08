'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Icon } from '@knockdog/ui';

import { guardianKindergartenAttendingContent } from '@views/guardian-kindergarten-page/config/guardianKindergartenAttendingContent';
import {
  formatAttendingDuration,
  formatKoreanAmPmTime,
} from '@views/guardian-kindergarten-page/lib/formatGuardianAttendance';
import { formatKoreanDateWithWeekday } from '@views/guardian-kindergarten-page/lib/formatGuardianKindergartenDate';
import type { GuardianLinkedKindergarten } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

import { GuardianAlbumPhotoStack } from './GuardianAlbumPhotoStack';
import { GuardianKindergartenWeekCalendar } from './GuardianKindergartenWeekCalendar';
import { GuardianLinkedKindergartenCard } from './GuardianLinkedKindergartenCard';

interface GuardianKindergartenAttendingStateProps {
  kindergarten: GuardianLinkedKindergarten;
  checkInAt: Date;
  hasDailyNotice: boolean;
  albumPhotos: string[];
}

function GuardianKindergartenAttendingState({
  kindergarten,
  checkInAt,
  hasDailyNotice,
  albumPhotos,
}: GuardianKindergartenAttendingStateProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const content = guardianKindergartenAttendingContent;
  const checkInTimeLabel = formatKoreanAmPmTime(checkInAt);
  const durationLabel = formatAttendingDuration(checkInAt, now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className='min-h-0 w-full flex-1 overflow-y-auto pb-(--bottom-bar-height)'>
      <div className='px-x4 flex w-full flex-col gap-5 py-6'>
        {/* 날짜 + 등원 경과 */}
        <div className='flex w-full items-center justify-between'>
          <div className='gap-x1 flex items-center'>
            <Icon icon='Paw' className='text-text-accent size-6' aria-hidden='true' />
            <p className='h3-extrabold text-text-primary'>{formatKoreanDateWithWeekday(selectedDate)}</p>
          </div>
          <span className='border-line-accent label-semibold text-text-accent shrink-0 rounded-full border px-3.5 py-2'>
            {durationLabel}
          </span>
        </div>

        {/* 알림장 */}
        {!hasDailyNotice ? (
          <div className='bg-bg-50 radius-r3 flex w-full items-center justify-center gap-2 overflow-hidden p-4'>
            <Image
              src={content.noticePreparingIconSrc}
              alt={content.noticePreparingIconAlt}
              width={32}
              height={32}
              className='size-8 shrink-0 object-contain'
            />
            <p className='body2-bold text-text-secondary'>{content.noticePreparingMessage}</p>
          </div>
        ) : null}

        {/* 오늘의 앨범 (<3장) */}
        <section className='flex w-full flex-col items-center gap-5'>
          <div className='flex w-full items-center justify-between'>
            <p className='h3-extrabold text-text-primary'>{content.albumTitle}</p>
            <button type='button' className='gap-x1 flex items-center justify-center rounded px-2 py-1'>
              <span className='label-semibold text-text-tertiary'>{content.albumViewAllLabel}</span>
              <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
            </button>
          </div>

          <div className='flex flex-col items-center gap-2'>
            <GuardianAlbumPhotoStack photos={albumPhotos} />
            {albumPhotos.length > 0 ? (
              <p className='body2-bold text-center'>
                <span className='text-text-accent'>{content.albumArrivedAccent}</span>
                <span className='text-text-secondary'>{content.albumArrivedSuffix}</span>
              </p>
            ) : null}
          </div>
        </section>
      </div>

      {/* 주간 캘린더 + 등원 타임라인 */}
      <section className='flex w-full flex-col items-center'>
        <GuardianKindergartenWeekCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <div className='flex w-full items-start gap-4 p-4'>
          <p className='caption1-regular text-text-secondary shrink-0 pt-2'>{checkInTimeLabel}</p>
          <div className='bg-bg-50 radius-r2 flex h-9 flex-1 items-center justify-center px-4 py-2'>
            <p className='body2-regular text-text-primary'>{content.checkInLabel}</p>
          </div>
        </div>
      </section>

      {/* 유치원 카드 + 이력 */}
      <section className='px-x4 mt-4 flex w-full flex-col items-center gap-4 pb-5'>
        <GuardianLinkedKindergartenCard kindergarten={kindergarten} />
        <button
          type='button'
          className='gap-x1 flex items-center justify-center rounded px-2 py-1'
          // TODO: 유치원 연결 이력 라우팅 연결
        >
          <span className='label-semibold text-text-tertiary'>{content.historyLabel}</span>
          <Icon icon='ChevronRight' className='text-fill-secondary-500 size-4' />
        </button>
      </section>
    </div>
  );
}

export { GuardianKindergartenAttendingState };
