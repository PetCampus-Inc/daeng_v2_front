'use client';

import { useMemo, useState } from 'react';
import {
  ActionButton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  TextFieldInput,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';
import { Header } from '@widgets/Header';

import { FilterChip } from '@features/kindergarten-list';
import { useStackNavigation } from '@shared/lib/bridge';
import { TextHighlights } from '@shared/ui/text-highlights';
import { toast } from '@shared/ui/toast';

interface AttendanceMember {
  id: string;
  name: string;
  guardianName?: string;
  gender: 'MALE' | 'FEMALE';
  breed: string;
  weightKg: number;
  age?: number;
  profileImageUrl?: string;
  checkedIn: boolean;
  checkedOut: boolean;
  noticebookSent: boolean;
}

const BASE_TODAY_ATTENDANCE_COUNT = 12;
const BASE_ENROLLED_COUNT = 8;
const BASE_PENDING_NOTICEBOOK_COUNT = 7;

const INITIAL_MEMBERS: AttendanceMember[] = [
  {
    id: '1',
    name: '초코',
    gender: 'MALE',
    breed: '사모예드',
    weightKg: 8,
    age: 3,
    checkedIn: false,
    checkedOut: false,
    noticebookSent: false,
  },
  {
    id: '2',
    name: '구름',
    gender: 'FEMALE',
    breed: '비숑',
    weightKg: 5,
    checkedIn: false,
    checkedOut: false,
    noticebookSent: false,
  },
  {
    id: '3',
    name: '두부',
    gender: 'MALE',
    breed: '푸들',
    weightKg: 6,
    age: 4,
    checkedIn: true,
    checkedOut: false,
    noticebookSent: false,
  },
  {
    id: '4',
    name: '라떼',
    gender: 'FEMALE',
    breed: '말티즈',
    weightKg: 4,
    age: 2,
    checkedIn: true,
    checkedOut: true,
    noticebookSent: false,
  },
  {
    id: '5',
    name: '보리',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 9,
    checkedIn: true,
    checkedOut: false,
    noticebookSent: true,
  },
  {
    id: '6',
    name: '보리66',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 9,
    checkedIn: true,
    checkedOut: false,
    noticebookSent: true,
  },
  {
    id: '7',
    name: '보리77',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 9,
    checkedIn: true,
    checkedOut: false,
    noticebookSent: true,
  },
  {
    id: '8',
    name: '보리88',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 9,
    checkedIn: true,
    checkedOut: false,
    noticebookSent: true,
  },
  {
    id: '9',
    name: '보리99.',
    gender: 'MALE',
    breed: '시바견',
    weightKg: 10,
    checkedIn: true,
    checkedOut: false,
    noticebookSent: true,
  },
];

const INITIAL_CHECKED_IN_COUNT = INITIAL_MEMBERS.filter((member) => member.checkedIn).length;
const TAB_CONTENT_CLASS =
  'bg-bg-50 min-h-0 flex-1 overflow-y-auto pb-[calc(var(--bottom-bar-height)+20px)]';
function normalizeSearchText(value: string) {
  return value.replace(/\s+/g, '').toLowerCase();
}

function OwnerDailyPage() {
  const { push } = useStackNavigation();
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showUncheckedOnly, setShowUncheckedOnly] = useState(false);
  const currentCheckedInCount = members.filter((member) => member.checkedIn).length;
  const attendanceDelta = currentCheckedInCount - INITIAL_CHECKED_IN_COUNT;
  const normalizedSearchKeyword = normalizeSearchText(searchKeyword);
  const summaryItems = [
    { label: '오늘 등원', count: BASE_TODAY_ATTENDANCE_COUNT + attendanceDelta },
    { label: '재원 중', count: BASE_ENROLLED_COUNT + attendanceDelta },
    { label: '알림장 발송 전', count: BASE_PENDING_NOTICEBOOK_COUNT },
  ];
  const sortedMembers = useMemo(
    () =>
      [...members].sort((currentMember, nextMember) =>
        currentMember.name.localeCompare(nextMember.name, 'ko-KR')
      ),
    [members]
  );
  const searchedMembers = useMemo(() => {
    if (!normalizedSearchKeyword) return sortedMembers;

    return sortedMembers.filter((member) =>
      [member.name, member.guardianName ?? '']
        .map(normalizeSearchText)
        .some((searchTarget) => searchTarget.includes(normalizedSearchKeyword))
    );
  }, [normalizedSearchKeyword, sortedMembers]);
  const attendanceCheckMembers = showUncheckedOnly
    ? searchedMembers.filter((member) => !member.checkedIn)
    : searchedMembers;
  const todayAttendanceMembers = searchedMembers.filter((member) => member.checkedIn);

  const showRequestFailureToast = () => {
    toast({
      title: '일시적 오류로 요청을 완료하지 못했어요',
      nativeTitle: '일시적 오류로 요청을 완료하지 못했어요',
    });
  };

  const sendAttendancePush = async (_member: AttendanceMember, _type: 'check-in' | 'cancel-check-in') => {
    // TODO: 실제 API 계약 연결 시 보호자 푸시 발송 mutation을 여기에서 호출합니다.
  };

  const handleMemberClick = (memberId: string) => {
    push({ pathname: `/owner/members/${memberId}` }).catch(showRequestFailureToast);
  };

  const handleSearchKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value);
  };

  const handleClearSearchKeyword = () => {
    setSearchKeyword('');
  };

  const handleCheckFilterClick = () => {
    setShowUncheckedOnly((prevShowUncheckedOnly) => !prevShowUncheckedOnly);
  };

  const handleCheckIn = async (member: AttendanceMember) => {
    try {
      await sendAttendancePush(member, 'check-in');
      setMembers((prevMembers) =>
        prevMembers.map((prevMember) =>
          prevMember.id === member.id ? { ...prevMember, checkedIn: true } : prevMember
        )
      );
      toast({
        title: `✓ ${member.name}를 등원 처리했어요`,
        nativeTitle: `✓ ${member.name}를 등원 처리했어요`,
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const cancelCheckIn = async (member: AttendanceMember, close: () => void) => {
    try {
      await sendAttendancePush(member, 'cancel-check-in');
      setMembers((prevMembers) =>
        prevMembers.map((prevMember) =>
          prevMember.id === member.id ? { ...prevMember, checkedIn: false } : prevMember
        )
      );
      close();
      toast({
        title: `✓ ${member.name}의 등원을 취소했어요`,
        nativeTitle: `✓ ${member.name}의 등원을 취소했어요`,
      });
    } catch {
      showRequestFailureToast();
    }
  };

  const handleCancelCheckIn = (member: AttendanceMember) => {
    if (member.checkedOut) {
      toast({
        title: '이미 하원 처리되어 등원을 취소할 수 없어요',
        nativeTitle: '이미 하원 처리되어 등원을 취소할 수 없어요',
      });
      return;
    }

    if (member.noticebookSent) {
      toast({
        title: '이미 알림장이 발송되어 등원을 취소할 수 없어요',
        nativeTitle: '이미 알림장이 발송되어 등원을 취소할 수 없어요',
      });
      return;
    }

    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex flex-col items-center gap-6 text-center'>
              <Avatar className='size-x13'>
                {member.profileImageUrl && (
                  <AvatarImage
                    src={member.profileImageUrl}
                    alt={`${member.name} 프로필 이미지`}
                    className='object-cover'
                  />
                )}
                <AvatarFallback className='bg-fill-secondary-50' />
              </Avatar>
              <span>
                <span className='text-text-accent'>{member.name}</span>의 등원을 취소할까요?
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription>취소하면 등원 전 상태로 돌아가요.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={close}>닫기</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelCheckIn(member, close)}>등원 취소</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleAttendanceButtonClick = (member: AttendanceMember) => {
    if (member.checkedIn) {
      handleCancelCheckIn(member);
      return;
    }

    handleCheckIn(member).catch(showRequestFailureToast);
  };

  const renderMemberCards = (items: AttendanceMember[]) =>
    items.map((member) => (
      <div
        key={member.id}
        role='button'
        tabIndex={0}
        className='bg-bg-0 radius-r3 flex h-20 w-full cursor-pointer items-center justify-between gap-3 p-4'
        onClick={() => {
          handleMemberClick(member.id);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleMemberClick(member.id);
          }
        }}
      >
        <div className='flex h-11 min-w-0 flex-1 gap-2 text-left'>
          <Avatar className='border-fill-secondary-100 size-x11 shrink-0 border-2'>
            {member.profileImageUrl && (
              <AvatarImage
                src={member.profileImageUrl}
                alt={`${member.name} 프로필 이미지`}
                className='object-cover'
              />
            )}
            <AvatarFallback className='bg-fill-secondary-50' />
          </Avatar>
          <div className='flex h-11 min-w-0 flex-1 flex-col justify-center'>
            <div className='flex h-6 min-w-0 items-center gap-1'>
              <span className='body1-extrabold text-text-primary truncate'>
                {TextHighlights(member.name, normalizedSearchKeyword)}
              </span>
              <span className='size-4 shrink-0' aria-hidden />
            </div>
            <span className='body2-regular text-text-secondary truncate'>
              {member.breed} · {member.weightKg}kg{member.age ? ` · ${member.age}살` : ''}
            </span>
          </div>
        </div>
        <div
          className='flex h-12 shrink-0 gap-2'
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {member.checkedIn ? (
            <button
              type='button'
              className='label-semibold text-text-tertiary flex h-12 w-[82px] items-center justify-center px-0'
              onClick={() => {
                handleAttendanceButtonClick(member);
              }}
            >
              등원 취소
            </button>
          ) : (
            <ActionButton
              type='button'
              variant='primaryFill'
              size='medium'
              className='h-12 w-[57px] px-0'
              onClick={() => {
                handleAttendanceButtonClick(member);
              }}
            >
              등원
            </ActionButton>
          )}
        </div>
      </div>
    ));

  const renderAttendanceTabContent = (
    items: AttendanceMember[],
    showBeforeFilter?: boolean,
    handleBeforeFilterClick?: () => void
  ) => (
    <div className='flex w-full flex-col gap-5 pt-5'>
      <div className='px-4'>
        <TextField
          prefix={<Icon icon='Search' className='size-x6 text-fill-secondary-700' />}
          className='border-line-600 bg-fill-secondary-0 shadow-[0px_1px_6px_0px_rgba(16,24,40,0.12)] h-x12'
        >
          <TextFieldInput
            type='search'
            value={searchKeyword}
            onChange={handleSearchKeywordChange}
            placeholder='강아지명, 보호자명을 검색해 보세요'
            aria-label='검색어 입력'
          />
          {searchKeyword && (
            <button
              type='button'
              onMouseDown={(event) => {
                event.preventDefault();
                handleClearSearchKeyword();
              }}
              aria-label='검색어 초기화'
              className='absolute top-1/2 right-4 flex -translate-y-1/2 cursor-pointer items-center justify-center'
            >
              <Icon icon='DeleteInput' className='size-x5 text-primitive-neutral-700' />
            </button>
          )}
        </TextField>
      </div>
      <div className='flex h-9 w-full items-center justify-between px-4'>
        <p className='body1-bold text-text-primary'>{items.length}마리</p>
        {handleBeforeFilterClick ? (
          <FilterChip type='button' variant='status' activated={showBeforeFilter} onClick={handleBeforeFilterClick}>
            등원 전
          </FilterChip>
        ) : null}
      </div>
      <div className='flex w-full flex-col gap-4 px-4'>{renderMemberCards(items)}</div>
    </div>
  );

  return (
    <div className='bg-bg-50 flex h-dvh flex-col'>
      <div className='bg-bg-0 pt-(--safe-area-inset-top,0px)'>
        <Header>
          <Header.Title>일과</Header.Title>
        </Header>
      </div>
      <main className='bg-bg-0 flex min-h-0 flex-1 flex-col'>
        <section className='bg-bg-0 flex h-[166px] w-full flex-col gap-4 pt-5 pb-4'>
          <div className='flex h-[26px] w-full gap-4 px-4'>
            <p className='h3-extrabold text-text-primary'>6월 18일 (화)</p>
          </div>
          <div className='flex h-[88px] w-full gap-2.5 px-4'>
            <div className='bg-bg-50 radius-r3 flex h-full w-full justify-between py-4'>
              {summaryItems.map((item) => (
                <div key={item.label} className='flex h-14 flex-1 flex-col items-center justify-center gap-1'>
                  <span className='caption1-regular text-text-secondary text-center leading-[18px]'>{item.label}</span>
                  <span className='h1-extrabold text-text-primary text-center'>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Tabs defaultValue='attendance-check' className='flex min-h-0 flex-1 flex-col'>
          <TabsList>
            <TabsTrigger value='attendance-check'>등원 처리</TabsTrigger>
            <TabsTrigger value='today-attendance'>오늘 등원</TabsTrigger>
          </TabsList>
          <TabsContent value='attendance-check' className={TAB_CONTENT_CLASS}>
            {renderAttendanceTabContent(
              attendanceCheckMembers,
              showUncheckedOnly,
              handleCheckFilterClick
            )}
          </TabsContent>
          <TabsContent value='today-attendance' className={TAB_CONTENT_CLASS}>
            {renderAttendanceTabContent(todayAttendanceMembers)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export { OwnerDailyPage };
