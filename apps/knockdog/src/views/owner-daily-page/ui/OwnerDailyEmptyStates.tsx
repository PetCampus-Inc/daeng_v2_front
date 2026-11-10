import { ActionButton } from '@knockdog/ui';

interface OwnerDailyNoMembersStateProps {
  onInviteGuardianClick: () => void;
}

function OwnerDailyNoMembersState({ onInviteGuardianClick }: OwnerDailyNoMembersStateProps) {
  return (
    <div className='flex min-h-0 flex-1 items-center justify-center px-4'>
      <div className='flex h-[180px] w-full max-w-[390px] flex-col items-center gap-5 p-4'>
        <div className='flex h-20 w-full flex-col items-center justify-center gap-1 text-center'>
          <p className='h2-extrabold text-text-primary'>아직 연결된 원생이 없어요</p>
          <p className='body1-regular text-text-secondary'>
            보호자를 초대하고 유치원 일과를
            <br />
            간편하게 관리해 보세요.
          </p>
        </div>
        <ActionButton
          type='button'
          variant='primaryFill'
          size='medium'
          className='h-12 w-[174px] gap-2'
          onClick={onInviteGuardianClick}
        >
          보호자 초대하기
        </ActionButton>
      </div>
    </div>
  );
}

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
  OwnerDailyPastCheckNoticeState,
  OwnerDailyPastNoRecordState,
  OwnerDailyNoMembersState,
  OwnerDailyNoAttendanceState,
  OwnerDailyNoUncheckedState,
  OwnerDailyFilterEmptyState,
  OwnerDailySearchEmptyState,
};
