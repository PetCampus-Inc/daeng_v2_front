'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage, Icon } from '@knockdog/ui';
import { useImagePicker, type WebImageAsset } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

interface OwnerProfileImageUploaderProps {
  profileImage?: string;
  onImageSelect?: (imageUri: string) => void;
}

function OwnerProfileImageUploader({ profileImage, onImageSelect }: OwnerProfileImageUploaderProps) {
  const { pickImage } = useImagePicker();
  const [selectedImage, setSelectedImage] = useState<string | undefined>(profileImage);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    setSelectedImage(profileImage);
  }, [profileImage]);

  const handleImagePick = async () => {
    try {
      const result = await pickImage({
        allowsMultipleSelection: false,
        selectionLimit: 1,
        quality: 0.8,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0] as WebImageAsset;
        setIsImageLoading(true);
        setSelectedImage(asset.uri);
        onImageSelect?.(asset.uri);
      }
    } catch (error) {
      console.error('이미지 선택 실패:', error);
      if ((error as string) === 'NO_PERMISSION_LIBRARY') {
        toast({
          title: '사진 접근 권한이 필요합니다.',
          position: 'bottom-above-nav',
        });
      } else {
        toast({
          title: error instanceof Error ? error.message : String(error),
          position: 'bottom-above-nav',
        });
      }
    }
  };

  return (
    <div className='relative flex items-center justify-center px-4 py-7'>
      <Avatar className='size-[120px] overflow-hidden'>
        {selectedImage ? (
          <AvatarImage
            key={selectedImage}
            src={selectedImage}
            className='object-cover transition-opacity duration-300'
            onLoad={() => setIsImageLoading(false)}
            style={{ opacity: isImageLoading ? 0 : 1 }}
          />
        ) : null}
        {!selectedImage && !isImageLoading ? <AvatarFallback className='bg-fill-secondary-50' /> : null}
      </Avatar>

      <button
        type='button'
        onClick={handleImagePick}
        className='border-line-100 absolute right-[35%] bottom-[15%] z-10 flex size-9 items-center justify-center rounded-full border bg-white p-2'
        aria-label='프로필 이미지 변경'
      >
        <Icon icon='Camera' className='size-5 text-[#000000]' />
      </button>
    </div>
  );
}

export { OwnerProfileImageUploader };
export type { OwnerProfileImageUploaderProps };
