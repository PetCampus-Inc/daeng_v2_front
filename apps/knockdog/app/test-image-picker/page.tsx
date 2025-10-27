'use client';

import { useState } from 'react';
import { useImagePicker } from '@shared/lib/media';
import type { ImageAsset } from '@knockdog/bridge-core';

export default function TestImagePickerPage() {
  const { pickImage, pickImages } = useImagePicker();
  const [selectedImages, setSelectedImages] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(false);

  async function handlePickSingle() {
    setLoading(true);
    try {
      const result = await pickImage({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.cancelled && result.assets) {
        setSelectedImages(result.assets);
      }
    } catch (error) {
      console.error('이미지 선택 실패:', error);
      alert('이미지 선택 실패');
    } finally {
      setLoading(false);
    }
  }

  async function handlePickMultiple() {
    setLoading(true);
    try {
      const result = await pickImages({
        quality: 0.9,
        selectionLimit: 5,
      });

      if (!result.cancelled && result.assets) {
        setSelectedImages(result.assets);
      }
    } catch (error) {
      console.error('이미지 선택 실패:', error);
      alert('이미지 선택 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-screen flex-col gap-4 p-6'>
      <h1 className='text-2xl font-bold'>이미지 피커 테스트</h1>

      <div className='flex gap-2'>
        <button
          onClick={handlePickSingle}
          disabled={loading}
          className='rounded-lg bg-blue-500 px-4 py-2 text-white disabled:opacity-50'
        >
          단일 이미지 선택
        </button>

        <button
          onClick={handlePickMultiple}
          disabled={loading}
          className='rounded-lg bg-green-500 px-4 py-2 text-white disabled:opacity-50'
        >
          다중 이미지 선택 (최대 5개)
        </button>
      </div>

      {selectedImages.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h2 className='text-xl font-semibold'>선택된 이미지 ({selectedImages.length}개)</h2>

          <div className='grid grid-cols-2 gap-4'>
            {selectedImages.map((asset, index) => (
              <div key={index} className='flex flex-col gap-2 rounded-lg border p-4'>
                <img src={asset.uri} alt={`선택된 이미지 ${index + 1}`} className='h-40 w-full rounded object-cover' />
                <div className='text-sm text-gray-600'>
                  <p>
                    크기: {asset.width} x {asset.height}
                  </p>
                  {asset.fileSize && <p>용량: {(asset.fileSize / 1024).toFixed(1)} KB</p>}
                  {asset.type && <p>타입: {asset.type}</p>}
                  {asset.fileName && <p>파일명: {asset.fileName}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
