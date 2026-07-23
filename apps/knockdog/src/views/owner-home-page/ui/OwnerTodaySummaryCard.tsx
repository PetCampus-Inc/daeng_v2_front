import { Avatar, AvatarFallback, AvatarImage, Divider, Icon } from '@knockdog/ui';

import type { OwnerHomeFriend } from '@views/owner-home-page/model/ownerHome';

interface OwnerTodaySummaryCardProps {
  dateLabel: string;
  dayLabel: string;
  currentTimeLabel: string;
  isError?: boolean;
  enrolledCount: number;
  arrivalCount: number;
  departureCount: number;
  friends: OwnerHomeFriend[];
  extraFriendCount: number;
  onFriendPreviewClick: () => void;
}

const ERROR_MESSAGE = '정보를 불러오지 못했어요';

function OwnerTodaySummaryCard({
  dateLabel,
  dayLabel,
  currentTimeLabel,
  isError = false,
  enrolledCount,
  arrivalCount,
  departureCount,
  friends,
  extraFriendCount,
  onFriendPreviewClick,
}: OwnerTodaySummaryCardProps) {
  const shouldShowFriendPreview = !isError && enrolledCount > 0;

  return (
    <div className={`${shouldShowFriendPreview ? 'h-[249px]' : 'h-[209px]'} w-full px-4`}>
      <div className='radius-r3 h-full w-full overflow-hidden'>
        <div className='bg-fill-primary-500 h-14 px-4'>
          <div className='radius-r3 flex h-14 w-full items-center justify-between py-4'>
            <div className='gap-x0_5 flex h-6 w-fit min-w-0 items-center'>
              <span className='body1-extrabold text-text-primary-inverse'>{dateLabel}</span>
              <span className='body1-extrabold text-text-primary-inverse'>{dayLabel}</span>
            </div>
            <div className='gap-x1 flex h-[18px] w-fit min-w-0 items-center'>
              <span className='text-size-caption1 text-text-primary-inverse leading-[18px] font-regular tracking-normal'>
                {currentTimeLabel}
              </span>
            </div>
          </div>
        </div>
        {isError ? (
          <div className='bg-bg-0 flex h-[153px] items-center justify-center p-4'>
            <span className='body2-regular text-text-secondary'>{ERROR_MESSAGE}</span>
          </div>
        ) : (
          <div className={`bg-bg-0 flex ${enrolledCount > 0 ? 'h-[193px]' : 'h-[153px]'} flex-col gap-4 p-4`}>
            <OwnerAttendanceStats
              enrolledCount={enrolledCount}
              arrivalCount={arrivalCount}
              departureCount={departureCount}
            />
            <Divider />
            <OwnerFriendPreview
              enrolledCount={enrolledCount}
              friends={friends}
              extraCount={extraFriendCount}
              onClick={onFriendPreviewClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function OwnerAttendanceStats({ enrolledCount, arrivalCount, departureCount }: {
  enrolledCount: number;
  arrivalCount: number;
  departureCount: number;
}) {
  return (
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
        <AttendanceCount label='오늘 등원' count={arrivalCount} />
        <AttendanceCount label='오늘 하원' count={departureCount} />
      </div>
    </div>
  );
}

function AttendanceCount({ label, count }: { label: string; count: number }) {
  return (
    <div className='flex h-[50px] min-w-0 flex-col items-end gap-2 text-right'>
      <span className='text-text-secondary text-size-caption1 leading-[18px] font-semibold tracking-normal'>
        {label}
      </span>
      <span className='text-text-primary text-[24px] leading-none font-extrabold tracking-normal'>{count}</span>
    </div>
  );
}

function OwnerFriendPreview({
  enrolledCount,
  friends,
  extraCount,
  onClick,
}: {
  enrolledCount: number;
  friends: OwnerHomeFriend[];
  extraCount: number;
  onClick: () => void;
}) {
  if (enrolledCount <= 0) {
    return (
      <div className='flex h-5 w-full items-center gap-[41px]'>
        <span className='body2-regular text-text-secondary'>함께하는 친구가 없어요</span>
      </div>
    );
  }

  return (
    <div className='flex h-[60px] w-full items-start justify-between'>
      <div className='flex h-[60px] w-fit min-w-0 flex-col gap-2'>
        <span className='body2-regular text-text-secondary flex h-5 items-center text-center'>
          지금 함께하는 친구들
        </span>
        <div className='flex h-8 w-fit items-center'>
          {friends.map((friend, index) => (
            <Avatar key={friend.id} className={`border-bg-0 size-8 border-2 ${index > 0 ? '-ml-2' : ''}`}>
              {friend.profileImageUrl ? (
                <AvatarImage src={friend.profileImageUrl} alt={`${friend.name} 프로필`} className='object-cover' />
              ) : null}
              <AvatarFallback className='bg-fill-secondary-100' />
            </Avatar>
          ))}
          {extraCount > 0 ? (
            <Avatar className='border-bg-0 bg-fill-secondary-200 -ml-2 size-8 border-2'>
              <AvatarFallback className='bg-fill-secondary-200'>
                <span className='text-size-caption1 text-text-secondary leading-[18px] font-regular tracking-normal'>
                  +{extraCount}
                </span>
              </AvatarFallback>
            </Avatar>
          ) : null}
        </div>
      </div>
      <button type='button' className='flex h-[26px] items-center gap-x-1 rounded px-2 py-1' onClick={onClick}>
        <span className='text-size-caption1 text-text-tertiary leading-[18px] font-semibold tracking-normal'>
          전체보기
        </span>
        <Icon icon='ChevronRight' className='text-fill-secondary-400 size-4' />
      </button>
    </div>
  );
}

export { OwnerTodaySummaryCard };
