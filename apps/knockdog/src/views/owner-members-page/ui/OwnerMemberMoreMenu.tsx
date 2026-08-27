'use client';

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Icon,
} from '@knockdog/ui';
import { overlay } from 'overlay-kit';
import { useState } from 'react';
import { RemoveScroll } from 'react-remove-scroll';

import { toast } from '@shared/ui/toast';

interface OwnerMemberMoreMenuProps {
  memberId: string;
  dogName: string;
  onDisconnect: (memberId: string) => Promise<void>;
}

interface OwnerMemberDisconnectDialogProps {
  isOpen: boolean;
  memberId: string;
  dogName: string;
  close: () => void;
  onDisconnect: (memberId: string) => Promise<void>;
}

function OwnerMemberDisconnectDialog({
  isOpen,
  memberId,
  dogName,
  close,
  onDisconnect,
}: OwnerMemberDisconnectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDisconnect = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await onDisconnect(memberId);
      toast({
        nativeTitle: `${dogName}의 유치원 연결을 해제했어요`,
        titleParts: [{ text: dogName, accent: true }, { text: '의 유치원 연결을 해제했어요' }],
        title: (
          <>
            <span className='text-text-accent'>{dogName}</span>
            <span>의 유치원 연결을 해제했어요</span>
          </>
        ),
      });
      close();
    } catch {
      toast({ title: '유치원 연결 해제에 실패했어요' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={close}>
      <AlertDialogContent className='max-w-[358px]'>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span className='text-text-accent'>{dogName}</span>의
            <br />
            유치원 연결을 해제할까요?
          </AlertDialogTitle>
          <AlertDialogDescription>
            연결을 해제하면 더 이상 해당 원생의 일과를
            <br />
            수행할 수 없어요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>취소</AlertDialogCancel>
          <AlertDialogAction disabled={isSubmitting} onClick={handleDisconnect}>
            연결 해제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function OwnerMemberMoreMenu({ memberId, dogName, onDisconnect }: OwnerMemberMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-end',
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, {
      outsidePress: true,
      outsidePressEvent: 'pointerdown',
    }),
    useRole(context, { role: 'menu' }),
  ]);

  const handleDisconnectClick = () => {
    setIsOpen(false);
    overlay.open(({ isOpen: isDialogOpen, close }) => (
      <OwnerMemberDisconnectDialog
        isOpen={isDialogOpen}
        memberId={memberId}
        dogName={dogName}
        close={close}
        onDisconnect={onDisconnect}
      />
    ));
  };

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        type='button'
        aria-label={`${dogName} 더보기`}
        aria-expanded={isOpen}
        className='flex size-10 shrink-0 items-center justify-center'
      >
        <Icon icon='More' className='text-fill-secondary-700 size-6 rotate-90' />
      </button>

      {isOpen && (
        <RemoveScroll forwardProps>
          <FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className='z-999'>
              <button
                type='button'
                role='menuitem'
                className='body2-regular text-text-primary border-line-200 bg-bg-0 radius-r2 h-x11 p-x3 flex w-[76px] items-center justify-center border text-center'
                onClick={handleDisconnectClick}
              >
                연결해제
              </button>
            </div>
          </FloatingFocusManager>
        </RemoveScroll>
      )}
    </>
  );
}

export { OwnerMemberMoreMenu };
