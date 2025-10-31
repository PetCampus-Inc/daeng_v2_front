import { useEffect, useMemo, useRef, useState } from 'react';

/** 이메일 인증 타이머 */
const useVerificationTimer = () => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimer = () => {
    if (timerRef.current) {
      setRemainingTime(null);
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (duration: number) => {
    clearTimer();
    setRemainingTime(duration);

    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemainingTime = Math.max(0, duration - elapsedSeconds);

      setRemainingTime(newRemainingTime);

      if (newRemainingTime <= 0) {
        clearTimer();
      }
    }, 1000);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const timerDisplay = useMemo(
    () =>
      remainingTime
        ? `${String(Math.floor(remainingTime / 60)).padStart(2, '0')}:${String(remainingTime % 60).padStart(2, '0')}`
        : null,
    [remainingTime]
  );

  const isRunning = remainingTime !== null;

  return { startTimer, clearTimer, timerDisplay, isRunning };
};

export { useVerificationTimer };
