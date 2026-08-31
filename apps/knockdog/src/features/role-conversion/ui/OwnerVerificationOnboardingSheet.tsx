'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { ActionButton, IconButton } from '@knockdog/ui';

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
/** 이 픽셀만큼 움직이기 전까진 가로/세로 중 어느 스와이프인지 판정을 보류한다. */
const DIRECTION_LOCK_THRESHOLD_PX = 8;

function OwnerVerificationOnboardingSheet({
  isOpen,
  close,
  requiresLogin = true,
}: OwnerVerificationOnboardingSheetProps) {
  const { push } = useStackNavigation();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const isLastStep = currentStep === STEP_COUNT - 1;

  const startX = useRef(0);
  const startY = useRef(0);
  const deltaX = useRef(0);
  const isDragging = useRef(false);
  /** null: 방향 미판정, 'horizontal': 캐러셀 스와이프, 'ignored': 의미 없는 세로 스와이프라 무시 */
  const dragDirection = useRef<'horizontal' | 'ignored' | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const textTrackRef = useRef<HTMLDivElement | null>(null);
  const openedPathnameRef = useRef(pathname);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  // 오버레이는 전역 Provider에 렌더링되므로, 화면이 바뀌면 명시적으로 닫는다.
  useEffect(() => {
    if (openedPathnameRef.current === pathname) return;
    close();
    openedPathnameRef.current = pathname;
  }, [close, pathname]);

  // 탭 전환 직전에는 닫힘 애니메이션 없이 제거한다.
  // 전환 후 blur는 이전 버전 네이티브 브리지 호환을 위한 fallback이다.
  useEffect(() => {
    const handleNativeTabBlur = () => {
      setShouldRender(false);
      close();
    };

    window.addEventListener('knockdog:native-tab-will-blur', handleNativeTabBlur);
    window.addEventListener('knockdog:native-tab-blur', handleNativeTabBlur);

    return () => {
      window.removeEventListener('knockdog:native-tab-will-blur', handleNativeTabBlur);
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
    dragDirection.current = null;
    startX.current = event.clientX;
    startY.current = event.clientY;
    deltaX.current = 0;
    // 새 제스처마다 기본값은 '가로 스와이프 우선' — 세로로 판정되면 아래에서 곧바로 해제한다.
    // 포인터 캡처는 가로로 확정된 뒤에만 가져간다 — 미리 가져가면 바텀시트(vaul) 쪽 캡처 획득과 겹쳐
    // 세로 스와이프(닫기 제스처)에 넘겨줄 때 캡처 소유권이 꼬일 수 있다.
    event.currentTarget.setAttribute('data-vaul-no-drag', '');
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !trackRef.current || !textTrackRef.current) return;

    const currentDeltaX = event.clientX - startX.current;
    const currentDeltaY = event.clientY - startY.current;

    if (dragDirection.current === null) {
      const isPastThreshold =
        Math.abs(currentDeltaX) >= DIRECTION_LOCK_THRESHOLD_PX || Math.abs(currentDeltaY) >= DIRECTION_LOCK_THRESHOLD_PX;
      if (!isPastThreshold) return;

      const isVerticalDominant = Math.abs(currentDeltaY) > Math.abs(currentDeltaX);

      if (isVerticalDominant) {
        // 위/아래 스와이프 모두 이 영역에선 의미 있는 동작이 없으므로 완전히 무시한다.
        // 바텀시트는 dismissible=false라 드래그-닫기 제스처 자체가 없다(X 버튼으로만 닫힘).
        isDragging.current = false;
        dragDirection.current = 'ignored';
        return;
      }

      dragDirection.current = 'horizontal';
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (dragDirection.current !== 'horizontal') return;

    deltaX.current = currentDeltaX;
    const rawPercent = -currentStep * 100 + (deltaX.current / trackRef.current.clientWidth) * 100;
    const percent = Math.min(0, Math.max(-(STEP_COUNT - 1) * 100, rawPercent));
    trackRef.current.style.transform = `translateX(${percent}%)`;
    trackRef.current.style.transition = 'none';
    textTrackRef.current.style.transform = `translateX(${percent}%)`;
    textTrackRef.current.style.transition = 'none';
  };

  const handlePointerUp = () => {
    if (!isDragging.current || !trackRef.current || !textTrackRef.current) return;
    isDragging.current = false;

    const ratio = Math.abs(deltaX.current) / (trackRef.current.clientWidth || 1);
    let targetStep = currentStep;
    if (ratio > SWIPE_THRESHOLD_RATIO) targetStep = deltaX.current < 0 ? currentStep + 1 : currentStep - 1;
    targetStep = clampStep(targetStep);

    setCurrentStep(targetStep);
    trackRef.current.style.transition = 'transform 250ms ease';
    trackRef.current.style.transform = `translateX(${-targetStep * 100}%)`;
    textTrackRef.current.style.transition = 'transform 250ms ease';
    textTrackRef.current.style.transform = `translateX(${-targetStep * 100}%)`;
  };

  if (!shouldRender) return null;

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange} dismissible={false}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal overflow-hidden p-0'>
        <IconButton
          icon='Close'
          aria-label='닫기'
          className='absolute top-4 right-4 z-10 size-6'
          iconClassName='size-6 text-line-100'
          onClick={close}
        />
        <div
          className='touch-pan-y select-none'
          data-vaul-no-drag
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          // 바텀시트(vaul)는 자식 요소 경계를 벗어나는 pointerout마다 내부 드래그 상태를 강제 리셋한다.
          // 캐러셀 안쪽(이미지/텍스트 등) 자식 요소 경계를 손가락이 스치기만 해도 이게 발생해서,
          // 세로 스와이프를 vaul에 넘긴 뒤 드래그가 멈춰버리는 원인이 된다 — 이 영역 밖으로 못 나가게 막는다.
          onPointerOut={(event) => event.stopPropagation()}
        >
          <div className='relative w-full overflow-hidden'>
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

          <div className='relative w-full overflow-hidden'>
            <div
              ref={textTrackRef}
              className='flex w-full'
              style={{
                transform: `translateX(${-currentStep * 100}%)`,
                transition: 'transform 250ms ease',
              }}
            >
              {ownerVerificationOnboardingSteps.map((item) => (
                <div
                  key={item.image}
                  className='flex h-[120px] w-full shrink-0 flex-col items-center justify-center gap-1 px-4 text-center'
                >
                  <h3 className='h2-extrabold text-text-primary break-keep'>{item.title}</h3>
                  <p className='body1-medium text-text-secondary whitespace-pre-line'>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <BottomSheet.Footer className='bg-bg-0 flex p-0!'>
          <div className='flex h-[104px] w-full flex-col items-center justify-center gap-2 px-4 py-2'>
            <div className='flex h-6 items-center justify-center gap-2 py-2'>
              {ownerVerificationOnboardingSteps.map((item, index) => (
                <span
                  key={item.image}
                  className={`size-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-fill-primary-500' : 'bg-fill-secondary-300'
                  }`}
                />
              ))}
            </div>

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
          </div>
        </BottomSheet.Footer>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { OwnerVerificationOnboardingSheet };
export type { OwnerVerificationOnboardingSheetProps };
