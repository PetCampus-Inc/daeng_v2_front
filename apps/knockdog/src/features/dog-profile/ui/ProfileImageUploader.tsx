'use client';

import React, { useState, useEffect } from 'react';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Icon,
} from '@knockdog/ui';
import { useImagePicker, type WebImageAsset } from '@shared/lib/media';
import { toast } from '@shared/ui/toast';

const PROFILE_IMAGE_RESIZE_THRESHOLD_BYTES = 10 * 1024 * 1024;

interface ProfileImageUploaderProps {
  profileImage?: string;
  onImageSelect?: (imageUri: string) => void;
}

function ProfileImageUploader({ profileImage, onImageSelect }: ProfileImageUploaderProps) {
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
        resizeThresholdBytes: PROFILE_IMAGE_RESIZE_THRESHOLD_BYTES,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0] as WebImageAsset;
        setIsImageLoading(true);
        setSelectedImage(asset.uri);
        onImageSelect?.(asset.uri);
      } else if (!result.cancelled && result.skipped?.oversizedCount) {
        toast({
          title: (
            <>
              <span className='text-text-accent'>20MB 이하의 사진만</span> 등록할 수 있어요.
            </>
          ),
          nativeTitle: '20MB 이하의 사진만 등록할 수 있어요.',
          titleParts: [
            { text: '20MB 이하의 사진만', accent: true },
            { text: ' 등록할 수 있어요.' },
          ],
          position: 'bottom-above-nav',
        });
      } else if (!result.cancelled && result.skipped?.invalidSpecCount) {
        toast({
          title: 'JPG, JPEG, PNG, HEIC, HEIF 형식의 20MB 이하 사진만 올릴 수 있어요.',
          position: 'bottom-above-nav',
        });
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

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  return (
    <div className='relative flex items-center justify-center px-4 py-7'>
      <Avatar className='h-[120px] w-[120px] overflow-hidden'>
        {selectedImage && (
          <AvatarImage
            key={selectedImage}
            src={selectedImage}
            className='object-cover transition-opacity duration-300'
            onLoad={handleImageLoad}
            style={{
              opacity: isImageLoading ? 0 : 1,
            }}
          />
        )}
        {!isImageLoading && (
          <AvatarFallback className='bg-primitive-neutral-100 rounded-full p-0.5'>
            <Icon icon='Paw' className='text-fill-secondary-400 h-[52px] w-[52px]' />
          </AvatarFallback>
        )}
      </Avatar>
      <button
        type='button'
        onClick={handleImagePick}
        className='border-line-100 absolute right-[35%] bottom-[15%] z-10 flex h-[36px] w-[36px] items-center justify-center rounded-full border bg-orange-500 p-2'
      >
        <Icon icon='Camera' className='text-text-primary-inverse' />
      </button>
    </div>
  );
}

export { ProfileImageUploader };
