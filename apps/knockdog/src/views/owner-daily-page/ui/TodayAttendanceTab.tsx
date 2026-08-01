import { ActionButton, Avatar, AvatarFallback, Icon } from '@knockdog/ui';

import { FilterChip } from '@features/kindergarten-list';

function TodayAttendanceTab() {
  return (
    <div className='flex min-h-full w-full flex-col gap-4 pt-5'>
      <div className='flex h-[38px] w-full items-center gap-2 px-4'>
        <FilterChip type='button' variant='toggle' activated>
          전체
        </FilterChip>
        <FilterChip type='button' variant='toggle'>
          재원 중
        </FilterChip>
        <FilterChip type='button' variant='toggle'>
          발송 전
        </FilterChip>
      </div>
      <div className='flex w-full flex-col gap-4 px-4 pb-5'>
        <div className='bg-bg-0 radius-r3 flex h-[192px] w-full flex-col items-start gap-4 p-4'>
          <div className='flex h-24 w-full flex-col items-start gap-4'>
            <div className='flex h-11 w-full items-start justify-between gap-[68px]'>
              <div className='flex h-11 w-[161px] items-center gap-2'>
                <Avatar className='size-x11 shrink-0'>
                  <AvatarFallback className='bg-fill-secondary-50' />
                </Avatar>
                <div className='flex h-11 w-[109px] flex-col items-start'>
                  <div className='flex h-6 w-12 items-center gap-1'>
                    <span className='body1-extrabold text-text-primary flex h-6 items-center'>보리</span>
                    <Icon icon='Male' className='text-text-accent size-4 shrink-0' />
                  </div>
                  <span className='body2-regular text-text-secondary flex h-5 items-center'>시바 · 5kg · 1살</span>
                </div>
              </div>
            </div>
            <div className='bg-bg-50 radius-r2 flex h-9 w-full items-center gap-4 px-4 py-2'>
              <div className='flex h-5 flex-1 items-center gap-2'>
                <div className='flex h-[18px] w-[39px] items-center gap-0.5'>
                  <Icon icon='Time' className='size-4 text-fill-secondary-400' />
                  <span className='caption1-semibold text-text-tertiary flex h-[18px] items-center'>등원</span>
                </div>
                <span className='body2-semibold text-text-secondary flex h-5 items-center'>오전 9:00</span>
              </div>
            </div>
          </div>
          <div className='flex h-12 w-full items-start gap-2'>
            <ActionButton type='button' variant='primaryLine' size='medium' className='flex-1'>
              하원
            </ActionButton>
            <ActionButton type='button' variant='primaryFill' size='medium' className='flex-1'>
              알림장 작성하기
            </ActionButton>
          </div>
        </div>
        <div className='bg-bg-0 radius-r3 flex h-[192px] w-full flex-col items-start gap-4 p-4'>
          <div className='flex h-24 w-full flex-col items-start gap-4'>
            <div className='flex h-11 w-full items-start justify-between gap-[68px]'>
              <div className='flex h-11 w-[161px] items-center gap-2'>
                <Avatar className='size-x11 shrink-0'>
                  <AvatarFallback className='bg-fill-secondary-50' />
                </Avatar>
                <div className='flex h-11 w-[109px] flex-col items-start'>
                  <div className='flex h-6 w-[62px] items-center gap-1'>
                    <span className='body1-extrabold text-text-primary flex h-6 items-center'>누룽지</span>
                    <Icon icon='Male' className='text-text-accent size-4 shrink-0' />
                  </div>
                  <span className='body2-regular text-text-secondary flex h-5 items-center'>시바 · 4kg · 2살</span>
                </div>
              </div>
              <div className='flex h-[26px] items-center justify-center rounded-[90px] bg-[#F0F9FF] px-2 py-1'>
                <span className='caption1-semibold flex h-[18px] items-center text-center text-[#0070D7]'>발송 완료</span>
              </div>
            </div>
            <div className='bg-bg-50 radius-r2 flex h-9 w-full items-center gap-4 px-4 py-2'>
              <div className='flex h-5 flex-1 items-center gap-2'>
                <div className='flex h-[18px] w-[39px] items-center gap-0.5'>
                  <Icon icon='Time' className='size-4 text-fill-secondary-400' />
                  <span className='caption1-semibold text-text-tertiary flex h-[18px] items-center'>등원</span>
                </div>
                <span className='body2-semibold text-text-secondary flex h-5 items-center'>오전 9:00</span>
              </div>
            </div>
          </div>
          <div className='flex h-12 w-full items-start gap-2'>
            <ActionButton type='button' variant='primaryLine' size='medium' className='flex-1'>
              하원
            </ActionButton>
            <ActionButton type='button' variant='tertiaryFill' size='medium' className='flex-1'>
              작성한 알림장 보기
            </ActionButton>
          </div>
        </div>
        <div className='bg-bg-0 radius-r3 flex h-[192px] w-full flex-col items-start gap-4 p-4'>
          <div className='flex h-24 w-full flex-col items-start gap-4'>
            <div className='flex h-11 w-full items-start justify-between gap-4'>
              <div className='flex h-11 w-[161px] items-center gap-2'>
                <Avatar className='size-x11 shrink-0'>
                  <AvatarFallback className='bg-fill-secondary-50' />
                </Avatar>
                <div className='flex h-11 w-[109px] flex-col items-start'>
                  <div className='flex h-6 w-12 items-center gap-1'>
                    <span className='body1-extrabold text-text-primary flex h-6 items-center'>흑미</span>
                    <Icon icon='Male' className='text-text-accent size-4 shrink-0' />
                  </div>
                  <span className='body2-regular text-text-secondary flex h-5 items-center'>시바 · 5kg · 1살</span>
                </div>
              </div>
              <div className='flex h-[26px] items-center justify-center rounded-[90px] bg-[#ECFDF3] px-2 py-1'>
                <span className='caption1-semibold flex h-[18px] items-center text-center text-[#039855]'>하원 완료</span>
              </div>
            </div>
            <div className='bg-bg-50 radius-r2 flex h-9 w-full items-center gap-4 px-4 py-2'>
              <div className='flex h-5 flex-1 items-center gap-2'>
                <div className='flex h-[18px] w-[39px] items-center gap-0.5'>
                  <Icon icon='Time' className='size-4 text-fill-secondary-400' />
                  <span className='caption1-semibold text-text-tertiary flex h-[18px] items-center'>등원</span>
                </div>
                <span className='body2-semibold text-text-secondary flex h-5 items-center'>오전 9:00</span>
              </div>
              <div className='flex h-5 flex-1 items-center gap-2'>
                <div className='flex h-[18px] w-[39px] items-center gap-0.5'>
                  <Icon icon='Time' className='size-4 text-fill-secondary-400' />
                  <span className='caption1-semibold text-text-tertiary flex h-[18px] items-center'>하원</span>
                </div>
                <span className='body2-semibold text-text-secondary flex h-5 items-center'>오후 6:00</span>
              </div>
            </div>
          </div>
          <div className='flex h-12 w-full items-start gap-2'>
            <ActionButton type='button' variant='secondaryLine' size='medium' className='flex-1'>
              하원 취소
            </ActionButton>
            <ActionButton type='button' variant='primaryFill' size='medium' className='flex-1'>
              알림장 작성하기
            </ActionButton>
          </div>
        </div>
        <div className='bg-bg-0 radius-r3 flex h-[192px] w-full flex-col items-start gap-4 p-4'>
          <div className='flex h-24 w-full flex-col items-start gap-4'>
            <div className='flex h-11 w-full items-start justify-between gap-4'>
              <div className='flex h-11 w-[161px] items-center gap-2'>
                <Avatar className='size-x11 shrink-0'>
                  <AvatarFallback className='bg-fill-secondary-50' />
                </Avatar>
                <div className='flex h-11 w-[109px] flex-col items-start'>
                  <div className='flex h-6 w-12 items-center gap-1'>
                    <span className='body1-extrabold text-text-primary flex h-6 items-center'>콜리</span>
                    <Icon icon='Male' className='text-text-accent size-4 shrink-0' />
                  </div>
                  <span className='body2-regular text-text-secondary flex h-5 items-center'>믹스 · 4kg · 1살</span>
                </div>
              </div>
              <div className='border-line-200 flex h-[26px] items-center justify-center rounded-[999px] border bg-bg-0 px-2 py-1'>
                <span className='caption1-semibold text-text-secondary flex h-[18px] items-center whitespace-nowrap text-center'>
                  일과 완료
                </span>
              </div>
            </div>
            <div className='bg-bg-50 radius-r2 flex h-9 w-full items-center gap-4 px-4 py-2'>
              <div className='flex h-5 flex-1 items-center gap-2'>
                <div className='flex h-[18px] w-[39px] items-center gap-0.5'>
                  <Icon icon='Time' className='size-4 text-fill-secondary-400' />
                  <span className='caption1-semibold text-text-tertiary flex h-[18px] items-center'>등원</span>
                </div>
                <span className='body2-semibold text-text-secondary flex h-5 items-center'>오전 9:00</span>
              </div>
              <div className='flex h-5 flex-1 items-center gap-2'>
                <div className='flex h-[18px] w-[39px] items-center gap-0.5'>
                  <Icon icon='Time' className='size-4 text-fill-secondary-400' />
                  <span className='caption1-semibold text-text-tertiary flex h-[18px] items-center'>하원</span>
                </div>
                <span className='body2-semibold text-text-secondary flex h-5 items-center'>오후 6:00</span>
              </div>
            </div>
          </div>
          <div className='flex h-12 w-full items-start gap-2'>
            <ActionButton type='button' variant='secondaryLine' size='medium' className='flex-1'>
              하원 취소
            </ActionButton>
            <ActionButton type='button' variant='tertiaryFill' size='medium' className='flex-1'>
              작성한 알림장 보기
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TodayAttendanceTab };
