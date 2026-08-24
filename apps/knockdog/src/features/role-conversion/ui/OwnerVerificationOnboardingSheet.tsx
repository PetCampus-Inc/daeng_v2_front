'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { ActionButton } from '@knockdog/ui';

import { ownerVerificationOnboardingSteps } from '@features/role-conversion/config/ownerVerificationOnboardingContent';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface OwnerVerificationOnboardingSheetProps {
  isOpen: boolean;
  close: () => void;
  requiresLogin?: boolean;
}

const STEP_COUNT = ownerVerificationOnboardingSteps.length;
const SWIPE_THRESHOLD_RATIO = 0.2;

function OwnerVerificationOnboardingSheet({
  isOpen,
  close,
  requiresLogin = true,
}: OwnerVerificationOnboardingSheetProps) {
  const { push } = useStackNavigation();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === STEP_COUNT - 1;

  const startX = useRef(0);
  const deltaX = useRef(0);
  const isDragging = useRef(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const openedPathnameRef = useRef(pathname);

  // 오버레이는 전역 Provider에 렌더링되므로, 화면이 바뀌면 명시적으로 닫는다.
  useEffect(() => {
    if (openedPathnameRef.current === pathname) return;
    close();
    openedPathnameRef.current = pathname;
  }, [close, pathname]);

  // 네이티브 탭 전환은 WebView의 pathname을 바꾸지 않으므로 blur 이벤트도 처리한다.
  useEffect(() => {
    const handleNativeTabBlur = () => close();
    window.addEventListener('knockdog:native-tab-blur', handleNativeTabBlur);

    return () => {
      window.removeEventListener('knockdog:native-tab-blur', handleNativeTabBlur);
    };
  }, [close]);

  const clampStep = (index: number) => Math.max(0, Math.min(STEP_COUNT - 1, index));

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  const goToVerification = () => {
    close();

    if (requiresLogin) {
      push({
        pathname: route.auth.login.root,
        params: { redirectTo: route.roleConversion.kindergartenSearch.root },
      });
      return;
    }

    push({ pathname: route.roleConversion.kindergartenSearch.root });
  };

  const handleNext = () => setCurrentStep((step) => clampStep(step + 1));

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = event.clientX;
    deltaX.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !trackRef.current) return;
    deltaX.current = event.clientX - startX.current;
    const percent = -currentStep * 100 + (deltaX.current / trackRef.current.clientWidth) * 100;
    trackRef.current.style.transform = `translateX(${percent}%)`;
    trackRef.current.style.transition = 'none';
  };

  const handlePointerUp = () => {
    if (!isDragging.current || !trackRef.current) return;
    isDragging.current = false;

    const ratio = Math.abs(deltaX.current) / (trackRef.current.clientWidth || 1);
    let targetStep = currentStep;
    if (ratio > SWIPE_THRESHOLD_RATIO) targetStep = deltaX.current < 0 ? currentStep + 1 : currentStep - 1;
    targetStep = clampStep(targetStep);

    setCurrentStep(targetStep);
    trackRef.current.style.transition = 'transform 250ms ease';
    trackRef.current.style.transform = `translateX(${-targetStep * 100}%)`;
  };

  // currentStep은 항상 clampStep으로 [0, STEP_COUNT - 1] 범위로 고정됨
  const step = ownerVerificationOnboardingSteps[currentStep]!;

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal overflow-hidden p-0'>
        <div
          className='relative w-full touch-pan-y overflow-hidden select-none'
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            ref={trackRef}
            className='flex w-full'
            style={{
              transform: `translateX(${-currentStep * 100}%)`,
              transition: 'transform 250ms ease',
            }}
          >
            {ownerVerificationOnboardingSteps.map((item, index) => (
              <div key={item.image} className='relative aspect-390/300 w-full shrink-0'>
                <Image
                  src={item.image}
                  alt=''
                  fill
                  sizes='(max-width: 480px) 100vw, 480px'
                  draggable={false}
                  className='pointer-events-none object-cover'
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col items-center gap-1 px-x6 py-x5 text-center'>
          <h3 className='h2-extrabold text-text-primary'>{step.title}</h3>
          <p className='body1-medium text-text-secondary whitespace-pre-line'>{step.body}</p>
        </div>

        <div className='flex justify-center gap-2 pb-x4'>
          {ownerVerificationOnboardingSteps.map((item, index) => (
            <span
              key={item.image}
              className={`size-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-fill-primary-500' : 'bg-fill-secondary-400'
              }`}
            />
          ))}
        </div>

        <BottomSheet.Footer>
          {isLastStep ? (
            <ActionButton
              type='button'
              variant='primaryFill'
              size='large'
              className='w-full'
              onClick={goToVerification}
            >
              원장 인증하기
            </ActionButton>
          ) : (
            <div className='flex w-full gap-2'>
              <ActionButton
                type='button'
                variant='secondaryLine'
                size='large'
                className='w-22 shrink-0'
                onClick={goToVerification}
              >
                건너뛰기
              </ActionButton>
              <ActionButton
                type='button'
                variant='primaryFill'
                size='large'
                className='flex-1'
                onClick={handleNext}
              >
                다음
              </ActionButton>
            </div>
          )}
        </BottomSheet.Footer>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { OwnerVerificationOnboardingSheet };
export type { OwnerVerificationOnboardingSheetProps };
