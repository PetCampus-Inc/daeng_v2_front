import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { useSocialUserStore, postReconnectSocial } from '@entities/social-user';
import { useVerificationTimer, useEmailVerification } from '@entities/email-verification';
import { route } from '@shared/constants/route';

const useVerifyEmailProcess = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  const { push } = useRouter();
  const socialUser = useSocialUserStore((state) => state.socialUser);

  const { mutate: reconnectSocialMutate } = useMutation({
    mutationFn: postReconnectSocial,
    onSuccess: () => handleReconnectSocialSuccess(),
  });

  const { startTimer, clearTimer, timerDisplay, isRunning } = useVerificationTimer();
  const { send, verification, error } = useEmailVerification({
    onVerificationSuccess: () => reconnectSocialMutate(),
  });

  const sendEmail = () => {
    if (socialUser) {
      // TODO: 토스트 메시지 추가 ("계정 인증 메일이 발송되었습니다.")

      if (isRunning) clearTimer();
      send(socialUser.email, socialUser.name);
      startTimer(180);
    }
  };

  /** 소셜 계정 재연동 성공 핸들러 */
  const handleReconnectSocialSuccess = () => {
    // TODO: 토스트 메시지 추가 ("계정이 성공적으로 연동되었습니다.")

    // 루트 페이지로 이동
    push(route.root);
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
