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

import type { AttendanceCheckinoutCandidate } from '@entities/owner-attendance-checkinout';

import { ellipsisText } from '@shared/utils';

type OwnerDailyCancelKind = 'checkIn' | 'checkOut';

const CANCEL_DIALOG_CONTENT: Record<OwnerDailyCancelKind, { target: string; description: string }> = {
  checkIn: { target: '등원', description: '취소하면 등원 전 상태로 돌아가요.' },
  checkOut: { target: '하원', description: '취소하면 재원 중 상태로 돌아가요.' },
};

interface OwnerDailyCancelDialogProps {
  /** 무엇을 취소하는지. 제목·본문·확인 버튼 문구가 이에 맞게 바뀐다. */
  kind: OwnerDailyCancelKind;
  member: Pick<AttendanceCheckinoutCandidate, 'name' | 'profileImageUrl'>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}

/** 등원·하원 취소 확인 모달. 원생 프로필과 `{이름}의 {등원|하원}을 취소할까요?` 제목을 보여 준다. */
const OwnerDailyCancelDialog = ({ kind, member, open, onOpenChange, onCancel }: OwnerDailyCancelDialogProps) => {
  const { target, description } = CANCEL_DIALOG_CONTENT[kind];

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
          <AlertDialogAction onClick={onCancel}>{target} 취소</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { OwnerDailyCancelDialog };
export type { OwnerDailyCancelKind };
