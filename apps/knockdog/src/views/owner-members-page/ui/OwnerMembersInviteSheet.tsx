'use client';

import { useEffect, useRef, useState } from 'react';
import { ActionButton, Icon } from '@knockdog/ui';
import { QRCodeSVG } from 'qrcode.react';

import { useOwnerInviteQuery } from '@entities/owner-member';
import { useUserStore } from '@entities/user';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useClipboardCopy, useShare, isNativeWebView } from '@shared/lib/device';
import { useSaveImage } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

interface OwnerMembersInviteSheetProps {
  isOpen: boolean;
  close: () => void;
}

const INVITE_ACTIONS = [
  {
    label: 'QR 저장',
    className: 'bg-fill-primary-500',
    icon: 'Download',
    action: 'downloadQr',
  },
  {
    label: '링크 복사',
    className: 'bg-success-bold',
    icon: 'Copy',
    action: 'copyLink',
  },
  {
    label: '공유하기',
    className: 'bg-info-bold',
    icon: 'Share',
    action: 'shareLink',
  },
] as const;

function downloadImage(url: string, filename: string) {
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function svgToPngDataUrl(svgElement: SVGElement): Promise<string | null> {
  const svg = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('QR 이미지 변환에 실패했습니다.'));
      image.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size, size);
    context.drawImage(image, 0, 0, size, size);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function OwnerMembersInviteSheet({ isOpen, close }: OwnerMembersInviteSheetProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const qrCodeContainerRef = useRef<HTMLDivElement>(null);
  const userId = useUserStore((state) => state.user?.userId);
  const inviteQuery = useOwnerInviteQuery({ userId, enabled: isOpen && !!userId });
  const inviteUrl = inviteQuery.data?.inviteUrl;
  const copy = useClipboardCopy();
  const share = useShare();
  const saveImage = useSaveImage();

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

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

  const handleOpenChange = (open: boolean) => {
    if (!open) close();
  };

  const handleDownloadQr = async () => {
    const qrCodeElement = qrCodeContainerRef.current?.querySelector('canvas, img, svg');
    if (!qrCodeElement) return;

    let dataUrl: string | null = null;

    if (qrCodeElement instanceof HTMLCanvasElement) {
      dataUrl = qrCodeElement.toDataURL('image/png');
    } else if (qrCodeElement instanceof HTMLImageElement) {
      dataUrl = qrCodeElement.src;
    } else if (qrCodeElement instanceof SVGElement) {
      dataUrl = await svgToPngDataUrl(qrCodeElement);
    }

    if (!dataUrl) return;

    const fileName = 'owner-invite-qr.png';

    // 네이티브 앱에서는 <a download>가 동작하지 않아 갤러리 저장 브릿지를 거쳐야 함
    if (isNativeWebView()) {
      const saved = await saveImage({ url: dataUrl, fileName });
      if (!saved) {
        toast('QR 코드를 저장하지 못했어요.');
      }
      return;
    }

    downloadImage(dataUrl, fileName);
  };

  const handleCopyInviteLink = async () => {
    if (!inviteUrl) return;

    await copy(inviteUrl);
  };

  const handleShareInviteLink = async () => {
    if (!inviteUrl) return;

    const shared = await share({
      url: inviteUrl,
    });

    if (!shared) {
      await copy(inviteUrl);
    }
  };

  const handleActionClick = (action: (typeof INVITE_ACTIONS)[number]['action']) => {
    if (action === 'downloadQr') {
      void handleDownloadQr();
      return;
    }

    if (action === 'copyLink') {
      void handleCopyInviteLink();
      return;
    }

    void handleShareInviteLink();
  };

  const isInviteActionDisabled = !inviteUrl;

  if (!shouldRender) return null;

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={handleOpenChange}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Title className='sr-only'>보호자 초대</BottomSheet.Title>
        <div className='h-[468px] w-full'>
          <div className='px-x4 py-x2 grid h-[92px] grid-cols-3'>
            {INVITE_ACTIONS.map((action) => (
              <button
                key={action.label}
                type='button'
                className='gap-x1 flex h-[76px] min-w-0 flex-col items-center justify-center px-x1 disabled:opacity-40'
                disabled={isInviteActionDisabled}
                onClick={() => handleActionClick(action.action)}
              >
                <span
                  className={`${action.className} gap-x2_5 flex size-x12 items-center justify-center rounded-full p-x2`}
                >
                  {'icon' in action && <Icon icon={action.icon} className='text-text-primary-inverse size-x8' />}
                </span>
                <span className='body1-regular text-text-primary whitespace-nowrap'>{action.label}</span>
              </button>
            ))}
          </div>

          <div
            ref={qrCodeContainerRef}
            className='py-x10 gap-x2_5 flex h-[280px] w-full items-center justify-center'
          >
            {inviteUrl ? (
              <QRCodeSVG
                value={inviteUrl}
                size={200}
                className='size-[200px]'
                level='M'
                marginSize={0}
                title='보호자 초대 QR 코드'
              />
            ) : inviteQuery.isError ? (
              <div className='body1-regular text-text-secondary text-center'>
                초대 링크를 불러오지 못했어요.
              </div>
            ) : (
              <div className='bg-fill-secondary-100 h-[200px] w-[200px]' />
            )}
          </div>

          <div className='px-x4 py-x5 gap-x2 flex h-[96px] w-full'>
            <ActionButton type='button' variant='primaryFill' size='large' onClick={close}>
              닫기
            </ActionButton>
          </div>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}

export { OwnerMembersInviteSheet };
