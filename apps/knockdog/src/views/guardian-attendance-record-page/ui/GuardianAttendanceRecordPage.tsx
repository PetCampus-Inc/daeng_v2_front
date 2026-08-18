'use client';

import { useSearchParams } from 'next/navigation';
import { useGuardianCalendarDetailQuery } from '@entities/guardian-home';
import { useUserStore } from '@entities/user';
import { PageError } from '@shared/ui/page-error';
import { useStackNavigation } from '@shared/lib/bridge';

function validDate(value: string | null) {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/** 푸시 payload의 petId/date를 기준으로 보호자용 발송 알림장을 조회한다. */
function GuardianAttendanceRecordPage() {
  const searchParams = useSearchParams();
  const { back } = useStackNavigation();
  const userId = useUserStore((state) => state.user?.userId);
  const petId = searchParams.get('petId');
  const date = searchParams.get('date');
  const hasValidParams = Boolean(petId && /^\d+$/.test(petId) && validDate(date));
  const query = useGuardianCalendarDetailQuery({
    userId,
    petId,
    date,
    enabled: hasValidParams,
  });

  if (!hasValidParams) {
    return <PageError onRetry={() => void back()} />;
  }

  if (query.isPending) return <main className='bg-bg-0 min-h-dvh p-4' />;
  if (query.isError) return <PageError isRetrying={query.isFetching} onRetry={() => void query.refetch()} />;

  const notice = query.data?.dailyNotice;
  return (
    <main className='bg-bg-0 min-h-dvh px-4 py-6'>
      <button type='button' onClick={() => void back()} className='body2-semibold text-text-secondary mb-6'>
        뒤로가기
      </button>
      <h1 className='h2-extrabold text-text-primary'>{date} 알림장</h1>
      {notice ? (
        <section className='border-line-200 mt-5 rounded-2xl border p-5'>
          <div className='flex flex-wrap gap-2'>
            <span className='bg-bg-50 caption1-semibold rounded-full px-3 py-2'>{notice.conditionLabel}</span>
            <span className='bg-bg-50 caption1-semibold rounded-full px-3 py-2'>{notice.stoolLabel}</span>
          </div>
          <p className='body1-regular text-text-primary mt-5 whitespace-pre-wrap'>{notice.body}</p>
        </section>
      ) : (
        <p className='body1-regular text-text-secondary mt-5'>조회할 수 있는 알림장이 없어요.</p>
      )}
    </main>
  );
}

export { GuardianAttendanceRecordPage };
