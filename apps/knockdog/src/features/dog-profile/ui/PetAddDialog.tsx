import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  Icon,
} from '@knockdog/ui';

interface PetAddDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function PetAddDialog({ isOpen, onOpenChange }: PetAddDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            첫 강아지 등록시, <br /> 사용자 닉네임이 변경 돼요!
          </AlertDialogTitle>

          <div>
            <div className='bg-fill-secondary-50 mb-2 flex flex-col items-center justify-center gap-y-2 rounded-lg p-4'>
              <span className='h3-medium text-text-tertiary'>일이삼사오육칠팔구십일이삼</span>
              <Icon icon='ChevronBottom' />
              <span className='h3-medium'>일이삼사오육칠팔구십일이삼</span>
            </div>

            <span className='body1-regular text-text-secondary'>
              강아지 프로필을 모두 삭제할 경우, <br /> 직접 사용자 닉네임을 설정할 수 있어요.
            </span>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { PetAddDialog };
