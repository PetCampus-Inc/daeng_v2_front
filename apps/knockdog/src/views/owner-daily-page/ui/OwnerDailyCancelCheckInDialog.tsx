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
} from '@knockdog/ui';

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';

interface OwnerDailyCancelCheckInDialogProps {
  member: AttendanceMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}

function OwnerDailyCancelCheckInDialog({
  member,
  open,
  onOpenChange,
  onCancel,
}: OwnerDailyCancelCheckInDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          <AlertDialogCancel>닫기</AlertDialogCancel>
          <AlertDialogAction onClick={onCancel}>등원 취소</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { OwnerDailyCancelCheckInDialog };
