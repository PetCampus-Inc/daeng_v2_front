import { useState, type MouseEvent } from 'react';
import {
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
} from '@knockdog/ui';

import { OWNER_DAILY_CANCEL_CONTENT, type OwnerDailyCancelKind } from '@views/owner-daily-page/config/ownerDailyContent';

import type { AttendanceCheckinoutCandidate } from '@entities/owner-attendance-checkinout';

import { ellipsisText } from '@shared/utils';

interface OwnerDailyCancelDialogProps {
  /** 무엇을 취소하는지. 제목·본문·확인 버튼 문구가 이에 맞게 바뀐다. */
  kind: OwnerDailyCancelKind;
  member: Pick<AttendanceCheckinoutCandidate, 'name' | 'profileImageUrl'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `취소하기`를 눌렀을 때 취소 요청을 보낸다. 요청이 끝날 때까지 모달은 열려 있고 버튼은 잠긴다. */
  onCancel: () => Promise<void>;
}

/** 등원·결석·하원 취소 확인 모달. 원생 프로필과 `{이름}의 {등원|결석|하원}을 취소할까요?` 제목을 보여 준다. */
const OwnerDailyCancelDialog = ({ kind, member, open, onOpenChange, onCancel }: OwnerDailyCancelDialogProps) => {
  const { target, description } = OWNER_DAILY_CANCEL_CONTENT[kind];
  const [isPending, setIsPending] = useState(false);

  /** 요청이 끝나면(성공·실패 모두) 모달을 닫는다. 결과는 토스트로 알린다. */
  const handleCancelClick = async (event: MouseEvent<HTMLButtonElement>) => {
    // 기본 동작(바로 닫힘)을 막고 요청이 끝난 뒤에 닫는다.
    event.preventDefault();
    if (isPending) return;

    setIsPending(true);
    try {
      await onCancel();
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className='max-w-[358px]'>
        <AlertDialogHeader className='px-x4'>
          <AlertDialogTitle className='flex flex-col items-center gap-6 text-center'>
            <Avatar className='size-x13'>
              {member.profileImageUrl && (
                <AvatarImage
                  src={member.profileImageUrl}
                  alt={`${member.name} 프로필 이미지`}
                  className='object-cover'
                />
              )}
              <AvatarFallback className='bg-bg-50'>
                <Icon icon='Paw' className='text-fill-secondary-300 size-5' aria-hidden='true' />
              </AvatarFallback>
            </Avatar>
            <span>
              <span className='text-text-accent'>{ellipsisText(member.name, 8)}</span>의 {target}을 취소할까요?
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='px-x4'>
          <AlertDialogCancel>닫기</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleCancelClick}>
            취소하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { OwnerDailyCancelDialog };
