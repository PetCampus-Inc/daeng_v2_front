import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

export const VERIFICATION_STATUS = {
  IDLE: 'IDLE', // 초기 상태
  RUNNING: 'RUNNING', // 시간 진행중
  PENDING: 'PENDING', // 시간 중지
  EXPIRED: 'EXPIRED', // 시간 만료
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

interface VerificationTimerProps {
  duration: number;
  onExpired?: () => void | Promise<void>;
}

export const useVerificationTimer = ({
  duration,
  onExpired,
}: VerificationTimerProps) => {
  const [status, setStatus] = useState<VerificationStatus>(
    VERIFICATION_STATUS.IDLE
  );
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerId = useRef<ReturnType<typeof setInterval> | null>(null);
  const onExpiredRef = useRef(onExpired);

  // 콜백 ref 업데이트
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  const clearTimer = useCallback(() => {
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (status === VERIFICATION_STATUS.RUNNING) return;

    setStatus(VERIFICATION_STATUS.RUNNING);
    setTimeLeft(duration);

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setStatus(VERIFICATION_STATUS.EXPIRED);
          onExpiredRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerId.current = id;
  }, [duration, clearTimer, status]);

  const stop = useCallback(() => {
    clearTimer();
    setStatus(VERIFICATION_STATUS.IDLE);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setTimeLeft(duration);
    setStatus(VERIFICATION_STATUS.IDLE);
  }, [clearTimer, duration]);

  // 컴포넌트 언마운트시 타이머 정리
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // MM:SS 형식으로 시간 포맷팅
  const formattedTime = useMemo(
    () =>
      `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(
        timeLeft % 60
      ).padStart(2, '0')}`,
    [timeLeft]
  );

  return {
    status,
    timeLeft,
    formattedTime,
    start,
    stop,
    reset,
    setStatus,
  };
};
