'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { usePetRepresentativeQuery, RELATIONSHIP_LABEL, usePetListQuery } from '@entities/pet';
import { useUserInfoQuery, useUserStore } from '@entities/user';
import { useSocialUserStore } from '@entities/social-user';
import { SOCIAL_PROVIDER_ICONS } from '@entities/social-user';
import { DogSelectSheet } from '@features/dog-profile';
import { useUserUpdateUserEmailMutation } from '@entities/user';
import { logout } from '@shared/lib/auth/logout';

function MypageProfileManagePage() {
  const { push, reset } = useStackNavigation();
  const queryClient = useQueryClient();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState('');

  const { data: userInfo } = useUserInfoQuery();
  const user = useUserStore((state) => state.user);
  const socialUser = useSocialUserStore((state) => state.socialUser);
  const { data: representativePet } = usePetRepresentativeQuery();
  const { data: petList } = usePetListQuery();
  const { mutate: updateUserEmail } = useUserUpdateUserEmailMutation();

  const isRepresentativePet = !!representativePet;

  useEffect(() => {
    if (userInfo?.infoRcvEmail) {
      setEmail(userInfo.infoRcvEmail);
    }
  }, [userInfo?.infoRcvEmail]);

  const handleLogout = () => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃하시겠습니까?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                logout();
                reset();
                close();
              }}
            >
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  const handleNicknameClick = () => {
    overlay.open(({ isOpen, close }) => <NicknameDialog isOpen={isOpen} close={close} />);
  };

  const handleRepresentativePetClick = () => {
    overlay.open(({ isOpen, close }) => <DogSelectSheet isOpen={isOpen} close={close} dogs={petList?.data || []} />);
  };

  const handleEmailEditToggle = () => {
    if (isEditingEmail) {
      // 완료 버튼 클릭 시 API 호출
      updateUserEmail(email, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['userInfo'] });
          setIsEditingEmail(false);
        },
      });
    } else {
      // 변경 버튼 클릭 시 편집 모드로 전환
      setIsEditingEmail(true);
    }
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
              {isRepresentativePet ? (
                <div className='body2-semibold text-text-primary'>
                  <span>대표 강아지 : </span>
                  <span className='text-text-accent'>{representativePet?.name}</span>
                </div>
              ) : (
                <button
                  className='label-semibold text-text-secondary flex items-center gap-x-1'
                  onClick={handleRepresentativePetClick}
                >
                  대표 강아지를 등록해 주세요
                  <Icon icon='ChevronRight' className='text-text-secondary h-5 w-5' />
                </button>
              )}
            </div>
            <TextField
              disabled={isRepresentativePet}
              readOnly={!isRepresentativePet}
              suffix={
                isRepresentativePet ? undefined : (
                  <IconButton icon='Edit' onClick={handleNicknameClick} className='text-text-secondary' />
                )
              }
            >
              <TextFieldInput
                value={
                  isRepresentativePet && representativePet
                    ? `${representativePet.name}의 ${RELATIONSHIP_LABEL[representativePet.relationship]}`
                    : user?.nickname || ''
                }
              />
            </TextField>
            <TextField disabled>
              <TextFieldInput value={user?.id || ''} />
            </TextField>
          </div>
          <div>
            <TextField
              label='아이디'
              disabled
              prefix={<Icon icon={SOCIAL_PROVIDER_ICONS[socialUser?.provider ?? 'GOOGLE']} className='h-5 w-5' />}
            >
              <TextFieldInput value={socialUser?.email || ''} />
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
              <div className='min-w-[80%] flex-1'>
                <TextField readOnly={!isEditingEmail}>
                  <TextFieldInput
                    placeholder='다른 이메일 주소를 입력해 주세요'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </TextField>
              </div>

              <ActionButton variant={isEditingEmail ? 'secondaryFill' : 'tertiaryFill'} onClick={handleEmailEditToggle}>
                {isEditingEmail ? '완료' : '변경'}
              </ActionButton>
            </div>
          </div>
        </div>

        <div className='mb-10 flex items-center justify-center px-4'>
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
