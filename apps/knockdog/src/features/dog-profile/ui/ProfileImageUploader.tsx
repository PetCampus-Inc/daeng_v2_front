'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Avatar, AvatarImage, AvatarFallback, Icon } from '@knockdog/ui';
import { useImagePicker, type WebImageAsset } from '@shared/lib/media';

interface ProfileImageUploaderProps {
  profileImage?: string;
  onImageSelect?: (imageUri: string) => void;
}

function ProfileImageUploader({ profileImage, onImageSelect }: ProfileImageUploaderProps) {
  const { pickImage } = useImagePicker();
  const [selectedImage, setSelectedImage] = useState<string | undefined>(profileImage);

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
        setSelectedImage(asset.uri);
        onImageSelect?.(asset.uri);
      }
    } catch (error) {
      console.error('이미지 선택 실패:', error);
    }
  };

  return (
    <div className='relative flex items-center justify-center px-4 py-7'>
      <Avatar className='h-[120px] w-[120px]'>
        {selectedImage && <AvatarImage src={selectedImage} />}
        <AvatarFallback className='border-line-200 rounded-full border p-0.5'>
          <Image src='/images/img_default_image.png' alt='default image' width={120} height={120} />
        </AvatarFallback>
      </Avatar>
      <button
        type='button'
        onClick={handleImagePick}
        className='absolute right-[35%] bottom-[10%] z-10 flex h-[36px] w-[36px] items-center justify-center rounded-full bg-white'
      >
        <Icon icon='Camera' />
      </button>
    </div>
  );
}

export { ProfileImageUploader };
