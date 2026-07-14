import { useState, useEffect } from 'react';
import {
  ActionButton,
  Icon,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@knockdog/ui';
import { MiniPhotoBox } from './MiniPhotoBox';
import { FullImageSheet } from './FullImageSheet';
import { overlay } from 'overlay-kit';
import { useImagePicker, type WebImageAsset } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { openSystemSetting } from '@shared/lib/bridge/openSystemSetting';

interface PhotoUploaderProps {
  maxCount?: number;
  quality?: number;
  defaultValue?: WebImageAsset[];
  onChange?: (assets: WebImageAsset[]) => void;
  /**
   * empty 상태 업로드 트리거 UI.
   * - button: 가로형 [+] 사진등록 (기본, memo/제보)
   * - tile: 정사각 [+] + n/max. full이면 disabled로 유지 (유치원 편집)
   */
  emptyVariant?: 'button' | 'tile';
  /** 2장 이상일 때 첫 번째 이미지에 대표 사진 뱃지 표시 */
  showRepresentativeBadge?: boolean;
  representativeBadgeLabel?: string;
}

function PhotoUploader({
  maxCount = 3,
  quality = 0.8,
  defaultValue,
  onChange,
  emptyVariant = 'button',
  showRepresentativeBadge = false,
  representativeBadgeLabel = '대표 사진',
}: PhotoUploaderProps) {
  const { pickImage } = useImagePicker();
  const [assets, setAssets] = useState<WebImageAsset[]>(defaultValue ?? []);

  useEffect(() => {
    if (defaultValue) {
      setAssets(defaultValue);
    }
  }, [defaultValue]);

  const state = assets.length === 0 ? 'empty' : assets.length < maxCount ? 'partial' : 'full';
  const isTileLayout = emptyVariant === 'tile';
  const isFull = state === 'full';
  const showUploadTile = isTileLayout || state === 'partial';

  const handlePickImages = async (source: 'library' | 'camera') => {
    if (isFull) return;

    try {
      const result = await pickImage({
        source,
        allowsMultipleSelection: true,
        selectionLimit: maxCount - assets.length,
        quality,
      });
      if (!result.cancelled && result.assets) {
        const newAssets = [...assets, ...(result.assets as WebImageAsset[])].slice(0, maxCount);
        setAssets(newAssets);
        onChange?.(newAssets);
      }
    } catch (error: unknown) {
      if ((error as string) === 'NO_PERMISSION_LIBRARY' || (error as string) === 'NO_PERMISSION_CAMERA') {
        overlay.open(({ isOpen, close }) => (
          <AlertDialog open={isOpen} onOpenChange={close}>
            <AlertDialogContent overlayClassName='z-102' className='z-103'>
              <AlertDialogHeader>
                <AlertDialogTitle>사진 접근 권한이 필요해요</AlertDialogTitle>
                <AlertDialogDescription>
                  사용 중인 기기에서 사진 접근 권한을 <br />
                  '허용'으로 설정해 주세요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>나중에 하기</AlertDialogCancel>
                <AlertDialogAction onClick={openSystemSetting}>설정하기</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ));
      } else {
        toast({
          title: error instanceof Error ? error.message : String(error),
          position: 'bottom-above-nav',
        });
      }
    }
  };

  const openSourceSelectSheet = () => {
    if (isFull) return;

    overlay.open(({ isOpen, close }) => (
      <BottomSheet.Root open={isOpen} onOpenChange={close} modal={false}>
        <BottomSheet.Overlay className='z-overlay' />
        <BottomSheet.Body className='z-modal'>
          <BottomSheet.Handle />

          <BottomSheet.Header className='border-line-200 border-b'>
            <BottomSheet.Title>이미지 소스 선택</BottomSheet.Title>
            <BottomSheet.CloseButton />
          </BottomSheet.Header>
          <div className='py-x5 flex flex-col pb-[40px]'>
            <button
              className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'
              onClick={() => {
                handlePickImages('library');
                close();
              }}
            >
              사진 보관함
            </button>
            <button
              className='p-x4 body1-bold text-text-primary border-line-200 active:bg-fill-secondary-50 border-b text-start'
              onClick={() => {
                handlePickImages('camera');
                close();
              }}
            >
              카메라로 촬영하기
            </button>
          </div>
        </BottomSheet.Body>
      </BottomSheet.Root>
    ));
  };

  const removeImage = (index: number) => {
    const newAssets = assets.filter((_, i) => i !== index);
    setAssets(newAssets);
    onChange?.(newAssets);
  };

  const handleImageClick = (index: number) => {
    overlay.open(({ isOpen, close }) => (
      <FullImageSheet
        isOpen={isOpen}
        close={close}
        images={assets.map((asset) => asset.uri)}
        initialIndex={index}
        onRemove={(deleteIndex) => {
          removeImage(deleteIndex);
        }}
      />
    ));
  };

  if (state === 'empty' && !isTileLayout) {
    return (
      <ActionButton variant='secondaryLine' size='medium' onClick={openSourceSelectSheet}>
        <Icon icon='Plus' className='size-x6' />
        사진등록
      </ActionButton>
    );
  }

  return (
    <div className='scrollbar-hide flex gap-2 overflow-x-auto'>
      {showUploadTile ? (
        <button
          type='button'
          onClick={openSourceSelectSheet}
          disabled={isFull}
          aria-label='사진 업로드'
          className={`body2-regular flex h-[80px] min-w-[80px] flex-col items-center justify-center rounded-lg border py-5 ${
            isFull
              ? 'border-line-200 text-text-tertiary cursor-not-allowed opacity-40'
              : 'border-line-400 text-text-tertiary'
          }`}
        >
          <Icon icon='Plus' className='h-6 w-6' />
          {assets.length} / {maxCount}
        </button>
      ) : null}

      {assets.map((asset, index) => (
        <div key={`${asset.uri}-${index}`} onClick={() => handleImageClick(index)}>
          <MiniPhotoBox
            imageUrl={asset.uri}
            className='h-[80px] w-[80px]'
            onRemove={() => removeImage(index)}
            badgeLabel={
              showRepresentativeBadge && assets.length >= 2 && index === 0
                ? representativeBadgeLabel
                : undefined
            }
          />
        </div>
      ))}
    </div>
  );
}

export { PhotoUploader };
