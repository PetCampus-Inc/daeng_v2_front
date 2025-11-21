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
} from '@knockdog/ui';
import { useState } from 'react';

interface NicknameDialogProps {
  isOpen: boolean;
  close: (isOpen: boolean) => void;
}

function NicknameDialog({ isOpen, close }: NicknameDialogProps) {
  const [nickname, setNickname] = useState('');

  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent className='box-border min-w-0'>
        <AlertDialogHeader>
          <AlertDialogTitle>
            똑독에서 활동할 <br /> 사용자 별명을 지어주세요
          </AlertDialogTitle>
        </AlertDialogHeader>
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

        <AlertDialogFooter className='min-w-0'>
          <AlertDialogCancel className='min-w-0 flex-1'>취소</AlertDialogCancel>
          <AlertDialogAction className='min-w-0 flex-1'>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default NicknameDialog;
