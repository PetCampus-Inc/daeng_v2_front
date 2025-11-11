import { useState } from 'react';
import { ActionButton, Icon } from '@knockdog/ui';
import { MiniPhotoBox } from './MiniPhotoBox';
import { FullImageSheet } from './FullImageSheet';
import { overlay } from 'overlay-kit';
import { useImagePicker, type WebImageAsset } from '@shared/lib/media';

interface PhotoUploaderProps {
  maxCount?: number;
  quality?: number;
  onChange?: (assets: WebImageAsset[]) => void;
}

function PhotoUploader({ maxCount = 3, quality = 0.8, onChange }: PhotoUploaderProps) {
  const { pickImage } = useImagePicker();
  const [assets, setAssets] = useState<WebImageAsset[]>([]);

  const state = assets.length === 0 ? 'empty' : assets.length < maxCount ? 'partial' : 'full';

  const handlePickImages = async () => {
    try {
      const result = await pickImage({
        allowsMultipleSelection: true,
        selectionLimit: maxCount - assets.length,
        quality,
      });

      if (!result.cancelled && result.assets) {
        const newAssets = [...assets, ...(result.assets as WebImageAsset[])];
        setAssets(newAssets);
        onChange?.(newAssets);
      }
    } catch (error) {
      console.error('이미지 선택 실패:', error);
    }
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
        <ActionButton variant='secondaryLine' size='medium' onClick={handlePickImages}>
          <Icon icon='Plus' className='size-x6' />
          사진등록
        </ActionButton>
      ) : (
        <div className='flex gap-2'>
          {state === 'partial' && (
            <button
              onClick={handlePickImages}
              type='button'
              className='border-line-400 body2-regular text-text-tertiary flex h-[80px] w-[80px] flex-col items-center justify-center rounded-lg border py-5'
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
