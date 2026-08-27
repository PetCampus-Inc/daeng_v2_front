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

import type { AttendanceMember } from '@views/owner-daily-page/config/ownerDailyContent';

interface OwnerDailyCancelCheckOutDialogProps {
  member: AttendanceMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
}

function OwnerDailyCancelCheckOutDialog({
  member,
  open,
  onOpenChange,
  onCancel,
}: OwnerDailyCancelCheckOutDialogProps) {
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
              <AvatarFallback className='bg-bg-50'>
                <Icon icon='Paw' className='text-fill-secondary-300 size-5' aria-hidden='true' />
              </AvatarFallback>
            </Avatar>
            <span>
              <span className='text-text-accent'>{member.name}</span>의 하원을 취소할까요?
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>취소하면 재원 중 상태로 돌아가요.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>닫기</AlertDialogCancel>
          <AlertDialogAction onClick={onCancel}>하원 취소</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { OwnerDailyCancelCheckOutDialog };
