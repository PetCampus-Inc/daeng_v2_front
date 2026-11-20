'use client';

import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

/**
 * 버튼 모양 (V4 Figma). 공통 AlertDialog 버튼의 기본값(radius-r3, body1-regular)과 달라서
 * 같은 종류의 유틸리티끼리는 `!`로 덮어쓴다.
 */
const BUTTON_CLASS_NAME = 'radius-r2! body1-bold!';

interface ConfirmDialogBaseProps {
  isOpen: boolean;
  /** 주면 `취소 + 확인` 두 버튼, 생략하면 확인 버튼 하나만 있는 안내창 */
  cancelLabel?: string;
  confirmLabel: string;
  /** 확인 버튼 색. `accent`(주황, 기본) | `neutral`(진회색) */
  confirmVariant?: 'accent' | 'neutral';
  /** 버튼 배치. `horizontal`(좌우, 기본) | `vertical`(상하, 위가 취소·아래가 확인) */
  buttonLayout?: 'horizontal' | 'vertical';
  /** true면 모달 바깥을 눌러 닫을 수 있다 */
  closeOnOutside?: boolean;
  onClose: () => void;
  /** 확인을 누르면 불린다. 모달은 저절로 닫히지 않으므로 부른 쪽이 닫고 할 일을 시작한다 */
  onConfirm: () => void;
}

/** 제목과 설명 중 하나는 생략할 수 있다. 설명의 `\n`은 줄바꿈으로 보인다 */
type ConfirmDialogTextProps =
  | { title: ReactNode; description?: string }
  | { title?: undefined; description: string };

type ConfirmDialogProps = ConfirmDialogBaseProps & ConfirmDialogTextProps;

/**
 * V4 공통 확인창. 제목·설명·버튼으로만 이루어지고 글은 왼쪽 정렬이다.
 * 앱 확인창과 같게, 버튼을 누르면 바로 닫히고 할 일은 닫는 순간 시작한다.
 */
const ConfirmDialog = ({
  isOpen,
  title,
  description,
  cancelLabel,
  confirmLabel,
  confirmVariant = 'accent',
  buttonLayout = 'horizontal',
  closeOnOutside = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const hasTitle = !!title;
  const hasDescription = !!description;

  useEffect(() => {
    if (!isOpen || !closeOnOutside) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || contentRef.current?.contains(target)) return;
      onClose();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [closeOnOutside, isOpen, onClose]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleConfirmClick = (event: MouseEvent<HTMLButtonElement>) => {
    // 눌러도 저절로 닫히지 않게 막는다. 닫는 일은 부른 쪽이 `onConfirm` 안에서 한다.
    event.preventDefault();
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        ref={contentRef}
        className='radius-r4 max-w-[326px]'
        // 열릴 때 첫 버튼이 눌린 것처럼 보이지 않게 자동 포커스를 막는다.
        onOpenAutoFocus={(event) => event.preventDefault()}
        // 제목·설명이 둘 다 있을 때만 설명을 연결한다. 하나만 있으면 그 글이 제목으로 읽힌다.
        {...(hasTitle && hasDescription ? {} : { 'aria-describedby': undefined })}
      >
        <AlertDialogHeader>
          {hasTitle ? (
            <AlertDialogTitle className='px-x1 whitespace-pre-line'>{title}</AlertDialogTitle>
          ) : (
            <AlertDialogTitle className='sr-only'>{description}</AlertDialogTitle>
          )}
          {hasDescription ? (
            <AlertDialogDescription className='body2-regular px-x1 whitespace-pre-line'>
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter
          className={cn(
            'pt-x5! pb-x6!',
            // 좌우 배치는 같은 너비의 두 칸으로 나눈다. (flex는 취소 버튼 테두리 때문에 2px 어긋난다)
            buttonLayout === 'vertical' ? 'flex-col' : cancelLabel && 'grid grid-cols-2'
          )}
        >
          {cancelLabel ? (
            <AlertDialogCancel className={BUTTON_CLASS_NAME}>
              {cancelLabel}
            </AlertDialogCancel>
          ) : null}
          <AlertDialogAction
            className={cn(
              BUTTON_CLASS_NAME,
              confirmVariant === 'neutral' && 'bg-fill-secondary-700 active:bg-fill-secondary-400'
            )}
            onClick={handleConfirmClick}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export { ConfirmDialog };
export type { ConfirmDialogProps };
