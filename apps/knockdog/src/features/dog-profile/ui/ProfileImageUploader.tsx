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
  /** 표시용 URL과 업로드된 S3 key를 함께 전달한다. */
  onImageSelect?: (imageUri: string, imageKey?: string) => void;
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
        onImageSelect?.(asset.uri, asset.key);
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
    <div className='relative flex items-center justify-center py-5'>
      <div className='relative h-[120px] w-[120px]'>
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
          aria-label='프로필 사진 변경'
          className='bg-bg-0 absolute top-[70%] left-[70%] z-10 flex size-9 items-center justify-center rounded-full p-1'
        >
          <Icon icon='Camera' className='text-fill-secondary-700 size-7' />
        </button>
      </div>
    </div>
  );
}

export { ProfileImageUploader };
