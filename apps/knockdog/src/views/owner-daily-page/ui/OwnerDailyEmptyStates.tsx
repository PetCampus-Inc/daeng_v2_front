import { ActionButton } from '@knockdog/ui';

function OwnerDailyNoUncheckedState() {
  return (
    <div className='flex min-h-0 flex-1 items-center justify-center px-4 text-center'>
      <div className='flex w-full flex-col items-center justify-center'>
        <p className='h2-extrabold text-text-primary'>등원 전 원생이 없어요</p>
        <p className='body1-regular text-text-secondary mt-1'>오늘 등원할 원생을 모두 처리했어요.</p>
      </div>
    </div>
  );
}

function OwnerDailySearchEmptyState() {
  return (
    <div className='flex min-h-0 flex-1 items-center justify-center text-center'>
      <div className='flex h-14 w-full flex-col items-center gap-1'>
        <p className='h2-extrabold text-text-primary w-full'>검색된 원생이 없어요</p>
        <p className='body1-regular text-text-primary w-full'>다른 원생을 검색해보세요.</p>
      </div>
    </div>
  );
}

function OwnerDailyNoAttendanceState() {
  return (
    <div className='flex min-h-0 flex-1 items-center justify-center px-4'>
      <p className='h2-extrabold text-text-primary text-center'>아직 등원한 원생이 없어요</p>
    </div>
  );
}

function OwnerDailyFilterEmptyState() {
  return (
    <div className='flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-4 text-center'>
      <p className='h2-extrabold text-text-primary'>선택한 조건에 맞는 원생이 없어요</p>
      <p className='body1-regular text-text-primary'>다른 조건을 선택해 보세요.</p>
    </div>
  );
}

/** 화면 중앙에 제목과(있으면) 본문을 보여 주는 안내. */
function OwnerDailyCenterMessage({ title, description }: { title: string; description?: string }) {
  return (
    <div className='bg-bg-50 flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-4 text-center'>
      <p className='h2-extrabold text-text-primary'>{title}</p>
      {description ? <p className='body1-regular text-text-secondary'>{description}</p> : null}
    </div>
  );
}

/** 미래 날짜에서 `등원처리` 탭을 열었을 때의 안내. 처리는 오늘만 할 수 있다. */
function OwnerDailyFutureNoticeState() {
  return (
    <OwnerDailyCenterMessage
      title='미래 날짜의 일과는 확인할 수 없어요'
      description='오늘 날짜로 이동해 일과를 관리해 보세요.'
    />
  );
}

/**
 * 오늘이나 미래 날짜에 예약한 원생이 하나도 없을 때의 안내. 연결된 원생이 없는 유치원도 같은 화면이다.
 * 오늘은 본문 없이 제목만, 미래 날짜는 오늘로 이동하라는 본문이 붙는다.
 */
function OwnerDailyNoReservationState({ isFuture }: { isFuture: boolean }) {
  return (
    <OwnerDailyCenterMessage
      title='등원 예정인 강아지가 없어요'
      description={isFuture ? '오늘 날짜로 이동해 일과를 관리해 보세요.' : undefined}
    />
  );
}

/** 등원 가능 시간이 설정되지 않았을 때 일과 화면 대신 보여 주는 안내. */
function OwnerDailyNotConfiguredState({ onSetUpClick }: { onSetUpClick: () => void }) {
  return (
    <div className='bg-bg-50 flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-4 text-center'>
      <div className='flex flex-col items-center gap-1'>
        <p className='h2-extrabold text-text-primary'>등원 가능 시간을 먼저 설정해 주세요</p>
        <p className='body1-regular text-text-secondary'>등원 가능 시간을 설정해야 보호자가 등원 예약을 할 수 있어요.</p>
      </div>
      <ActionButton type='button' variant='primaryFill' size='medium' onClick={onSetUpClick}>
        설정하기
      </ActionButton>
    </div>
  );
}

/** 지난 날짜에서 `등원처리` 탭을 열었을 때의 안내. 처리는 오늘만 할 수 있다. */
function OwnerDailyPastCheckNoticeState() {
  return (
    <div className='flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-4 text-center'>
      <p className='h2-extrabold text-text-primary'>지난 날짜의 일과는 확인할 수 없어요</p>
      <p className='body1-regular text-text-secondary'>오늘 날짜로 이동해 일과를 관리해 보세요.</p>
    </div>
  );
}

/** 지난 날짜에 등원·결석 기록이 하나도 없을 때의 안내. */
function OwnerDailyPastNoRecordState() {
  return (
    <div className='bg-bg-50 flex min-h-0 flex-1 flex-col items-center justify-center gap-1 px-4 text-center'>
      <p className='h2-extrabold text-text-primary'>등원 기록이 없어요</p>
      <p className='body1-regular text-text-secondary'>오늘 날짜로 이동해 일과를 관리해 보세요.</p>
    </div>
  );
}

export {
  OwnerDailyFutureNoticeState,
  OwnerDailyNoReservationState,
  OwnerDailyNotConfiguredState,
  OwnerDailyPastCheckNoticeState,
  OwnerDailyPastNoRecordState,
  OwnerDailyNoAttendanceState,
  OwnerDailyNoUncheckedState,
  OwnerDailyFilterEmptyState,
  OwnerDailySearchEmptyState,
};
