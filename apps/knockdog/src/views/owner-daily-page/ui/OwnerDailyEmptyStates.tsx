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
        <p className='h2-extrabold text-text-primary w-full'>검색 결과가 없어요</p>
        <p className='body1-regular text-text-primary w-full'>검색어를 다시 확인해 주세요.</p>
      </div>
    </div>
  );
}

export { OwnerDailyNoMembersState, OwnerDailyNoUncheckedState, OwnerDailySearchEmptyState };
