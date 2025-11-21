'use client';

import { Header } from '@widgets/Header';
import {
  Divider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Icon,
  IconButton,
  ActionButton,
  TextField,
  TextFieldInput,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';
import NicknameDialog from './NicknameDialog';
import { useStackNavigation } from '@shared/lib/bridge';

const mockData = {
  userNickname: '모모',
  userCode: '#KDOG00001234567890',
  dogName: '별이',
  id: 'tkg3022@gmail.com',
  // 정보 수신 이메일
  email: 'tkg3022@gmail.com',
};

function MypageProfileManagePage() {
  const { push } = useStackNavigation();

  const handleLogout = () => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃하시겠습니까?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleNicknameClick = () => {
    overlay.open(({ isOpen, close }) => <NicknameDialog isOpen={isOpen} close={close} />);
  };

  return (
    <>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>계정 관리</Header.Title>
      </Header>

      <div className='flex h-full flex-col justify-between'>
        <div className='flex flex-col gap-y-[40px] px-4'>
          <div className='flex flex-col gap-y-2'>
            <div className='flex items-center justify-between'>
              <span className='body2-bold text-text-primary'>내 별명</span>
              {/* <div className='body2-semibold text-text-primary'>
                <span>대표 강아지 : </span>
                <span className='text-text-accent'>{mockData.dogName}</span>
              </div> */}
              <button className='label-semibold text-text-secondary flex items-center gap-x-1'>
                대표 강아지를 등록해 주세요
                <Icon icon='ChevronRight' className='text-text-secondary h-5 w-5' />
              </button>
            </div>
            <TextField
              suffix={<IconButton icon='Edit' onClick={handleNicknameClick} className='text-text-secondary' />}
            >
              <TextFieldInput value={mockData.userNickname} />
            </TextField>
            <TextField disabled>
              <TextFieldInput value={mockData.userCode} />
            </TextField>
          </div>
          <div>
            <TextField label='아이디' disabled prefix={<Icon icon='GoogleLogo' className='h-5 w-5' />}>
              <TextFieldInput value={mockData.id} />
            </TextField>
          </div>
          <div className='flex flex-col gap-y-2'>
            <div className='flex items-center gap-x-2'>
              <span className='body2-bold'>정보 수신 이메일</span>
              <Tooltip className='h-6'>
                <TooltipTrigger />
                <TooltipContent className='max-w-[230px]'>
                  <p>
                    애플 계정 가입자 <br />
                    애플ID 설정에서 ‘이메일 연동 취소’를 할 경우, 이벤트 혜택 수신 및 고객 대응에 어려움이 있을 수
                    있으므로 새로 사용할 이메일 정보로 업데이트 하기를 권장해요.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className='flex gap-x-2'>
              <TextField value={mockData.email}>
                <TextFieldInput placeholder='다른 이메일 주소를 r입력해 주세요' />
              </TextField>

              <ActionButton variant='secondaryFill'>변경</ActionButton>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-center px-4'>
          <button onClick={handleLogout} className='label-semibold text-text-tertiary'>
            로그아웃
          </button>
          <Divider orientation='vertical' className='mx-4' />
          <button onClick={() => push({ pathname: '/withdraw/confirm' })} className='label-semibold text-text-tertiary'>
            탈퇴하기
          </button>
        </div>
      </div>
    </>
  );
}

export { MypageProfileManagePage };
