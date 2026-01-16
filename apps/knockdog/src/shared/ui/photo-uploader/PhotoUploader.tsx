import { useState, useEffect } from 'react';
import { ActionButton, Icon } from '@knockdog/ui';
import { MiniPhotoBox } from './MiniPhotoBox';
import { FullImageSheet } from './FullImageSheet';
import { overlay } from 'overlay-kit';
import { useImagePicker, type WebImageAsset } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';
import { BottomSheet } from '@shared/ui/bottom-sheet';

interface PhotoUploaderProps {
  maxCount?: number;
  quality?: number;
  defaultValue?: WebImageAsset[];
  onChange?: (assets: WebImageAsset[]) => void;
}

function PhotoUploader({ maxCount = 3, quality = 0.8, defaultValue, onChange }: PhotoUploaderProps) {
  const { pickImage } = useImagePicker();
  const [assets, setAssets] = useState<WebImageAsset[]>(defaultValue ?? []);

  useEffect(() => {
    if (defaultValue) {
      setAssets(defaultValue);
    }
  }, [defaultValue]);

  const state = assets.length === 0 ? 'empty' : assets.length < maxCount ? 'partial' : 'full';

  const handlePickImages = async (source: 'library' | 'camera') => {
    try {
      const result = await pickImage({
        source,
        allowsMultipleSelection: true,
        selectionLimit: maxCount - assets.length,
        quality,
      });
      if (!result.cancelled && result.assets) {
        const newAssets = [...assets, ...(result.assets as WebImageAsset[])];
        setAssets(newAssets);
        onChange?.(newAssets);
      }
    } catch (error: unknown) {
      toast({
        title: error instanceof Error ? error.message : String(error),
        position: 'bottom-above-nav',
      });
    }
  };

  const openSourceSelectSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <BottomSheet.Root open={isOpen} onOpenChange={close}>
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

  return (
    <div>
      {/* 상태별 UI */}
      {state === 'empty' ? (
        <ActionButton variant='secondaryLine' size='medium' onClick={openSourceSelectSheet}>
          <Icon icon='Plus' className='size-x6' />
          사진등록
        </ActionButton>
      ) : (
        <div className='flex gap-2'>
          {state === 'partial' && (
            <button
              onClick={openSourceSelectSheet}
              type='button'
              className='border-line-400 body2-regular text-text-tertiary flex h-[80px] min-w-[80px] flex-col items-center justify-center rounded-lg border py-5'
            >
              <Icon icon='Plus' className='h-6 w-6' />
              {assets.length} / {maxCount}
            </button>
          )}

          {assets.map((asset, index) => (
            <div key={`${asset.uri}-${index}`} onClick={() => handleImageClick(index)}>
              <MiniPhotoBox imageUrl={asset.uri} className='h-[80px] w-[80px]' onRemove={() => removeImage(index)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { PhotoUploader };
