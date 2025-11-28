import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  TextField,
  TextFieldInput,
  AlertDialogDescription,
} from '@knockdog/ui';
import { useState, useEffect } from 'react';
import { useUserUpdateNicknameMutation, useUserStore } from '@entities/user';
import { useQueryClient } from '@tanstack/react-query';

interface NicknameDialogProps {
  isOpen: boolean;
  close: (isOpen: boolean) => void;
}

function NicknameDialog({ isOpen, close }: NicknameDialogProps) {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [nickname, setNickname] = useState('');
  const queryClient = useQueryClient();

  // dialog가 열릴 때마다 최신 nickname으로 업데이트
  useEffect(() => {
    if (isOpen) {
      setNickname(user?.nickname || '');
    }
  }, [isOpen, user?.nickname]);

  const { mutate: updateNickname } = useUserUpdateNicknameMutation();

  const handleConfirm = () => {
    if (!nickname.trim()) return;

    updateNickname(nickname, {
      onSuccess: () => {
        // Zustand 스토어 업데이트
        if (user) {
          setUser({ ...user, nickname });
        }
        // React Query 캐시 무효화
        queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        close(false);
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent className='box-border min-w-0'>
        <AlertDialogHeader>
          <AlertDialogTitle>
            똑독에서 활동할 <br /> 사용자 별명을 지어주세요
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <div className='px-x5 py-x6 min-w-0'>
            <TextField required className='min-w-0'>
              <TextFieldInput
                placeholder='최대 13자 이내, 한글, 영문, 숫자'
                value={nickname}
                maxLength={13}
                onChange={(e) => setNickname(e.target.value)}
              />
            </TextField>
          </div>
        </AlertDialogDescription>

        <AlertDialogFooter className='min-w-0'>
          <AlertDialogCancel className='min-w-0 flex-1'>취소</AlertDialogCancel>
          <AlertDialogAction className='min-w-0 flex-1' onClick={handleConfirm}>
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default NicknameDialog;
