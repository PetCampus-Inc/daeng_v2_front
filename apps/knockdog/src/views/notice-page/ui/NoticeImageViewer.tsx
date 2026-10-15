'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import Image from 'next/image';
import { RemoveScroll } from 'react-remove-scroll';

import { IconButton } from '@knockdog/ui';
import { useNativeBackToClose } from '@shared/lib/bridge';

interface NoticeImageViewerProps {
  isOpen: boolean;
  close: () => void;
  src: string;
}

function NoticeImageViewer({ isOpen, close, src }: NoticeImageViewerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useNativeBackToClose(isOpen, close);

  useLayoutEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    return () => previousFocusRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close, isOpen]);

  if (!isOpen) return null;

  return (
    <RemoveScroll forwardProps>
      <div
        role='dialog'
        aria-modal='true'
        aria-label='공지사항 이미지 확대 보기'
        className='bg-dim-70 z-modal fixed inset-0'
      >
        <button type='button' tabIndex={-1} onClick={close} aria-label='이미지 닫기' className='absolute inset-0' />
        <IconButton
          ref={closeButtonRef}
          type='button'
          onClick={close}
          aria-label='이미지 닫기'
          icon='Close'
          iconClassName='size-6'
          className='text-text-primary-inverse absolute top-[max(16px,env(safe-area-inset-top))] right-4 z-10 size-10'
        />
        <div className='pointer-events-none absolute inset-x-4 top-16 bottom-16'>
          <Image src={src} alt='유치원에서 함께 있는 강아지들' fill sizes='100vw' className='object-contain' />
        </div>
      </div>
    </RemoveScroll>
  );
}

export { NoticeImageViewer };
