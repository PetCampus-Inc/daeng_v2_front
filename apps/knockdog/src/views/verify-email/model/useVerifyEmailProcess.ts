import { useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { useSocialUserStore, postReconnectSocial } from '@entities/social-user';
import { useVerificationTimer, useEmailVerification } from '@entities/email-verification';
import { User, useUserStore } from '@entities/user';
import { toast } from '@shared/ui/toast';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';

const useVerifyEmailProcess = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const { reset, getParams } = useStackNavigation();
  const [redirectTo] = useState(() => getParams()?.redirectTo as string | undefined);
  const socialUser = useSocialUserStore((state) => state.socialUser);
  const setUser = useUserStore((state) => state.setUser);

  const { mutate: reconnectSocialMutate } = useMutation({
    mutationFn: postReconnectSocial,
    onSuccess: ({ data }) => handleReconnectSocialSuccess(data),
  });

  const { startTimer, clearTimer, timerDisplay, isRunning } = useVerificationTimer();
  const { send, verification, error } = useEmailVerification({
    onVerificationSuccess: () => reconnectSocialMutate(),
  });

  const sendEmail = () => {
    if (socialUser) {
      toast({
        title: '계정 인증 메일이 발송되었습니다.',
        type: 'success',
        shape: 'square',
        position: 'top',
      });

      if (isRunning) clearTimer();
      send(socialUser.email, socialUser.name);
      startTimer(180);
    }
  };

  /** 소셜 계정 재연동 성공 핸들러 */
  const handleReconnectSocialSuccess = (user: User) => {
    setUser(user);

    toast({
      title: '계정이 성공적으로 연동되었습니다.',
      type: 'success',
      shape: 'square',
      position: 'bottom-above-nav',
    });

    reset(redirectTo ?? route.root);
  };

  // isInitialized를 ref로 사용 시, mutate의 처리 상태가 항상 Pending 상태로 유지 됨
  // 도전해 보실분은 ref로 사용해보세요! (해결 방법 저도 알려주기..)
  useEffect(() => {
    if (!isInitialized) setIsInitialized(true);
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) sendEmail();
  }, [isInitialized]);

  return {
    socialUser,
    timerDisplay,
    error,
    sendEmail,
    verification,
  };
};

export { useVerifyEmailProcess };
