import React from 'react';
import { RecommendedDogSchoolCard } from './RecommendedDogSchoolCard';
import type { ServiceTag } from '@entities/dog-school';

export const RecommendedDogSchoolSection = () => {
  const recommendedDogSchools = [
    {
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
      id: '1',
      title: '강아지 유치원 1',
      operationStatus: 'OPEN' as const,
      operationDescription: '20:00에 영업종료',
      price: 30000,
      isBookmarked: false,
      ctg: '유치원,호텔',
      dist: 10.9,
      roadAddress: '서울 강남구 논현로 123길 37',
      pickupType: 'FREE' as const,
      serviceTags: ['NON_SLIP', 'CCTV'] as (keyof typeof ServiceTag)[],
      reviewCount: 500,
      coord: {
        lat: 37.511281,
        lng: 126.883439,
      },
      memo: {
        id: '1',
        shopId: '1',
        content: '바우라움 유치원 내돈내산 이용후기',
        updatedAt: '2025.04.15',
      },
    },
    {
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
      id: '2',
      title: '강아지 유치원 2',
      operationStatus: 'OPEN' as const,
      operationDescription: '20:00에 영업종료',
      price: 30000,
      isBookmarked: false,
      ctg: '유치원,호텔',
      reviewCount: 500,
      dist: 10.9,
      roadAddress: '서울 강남구 논현로 123길 37',
      pickupType: 'FREE' as const,
      serviceTags: ['NON_SLIP', 'CCTV'] as (keyof typeof ServiceTag)[],
      coord: {
        lat: 37.511281,
        lng: 126.883439,
      },
    },
  ];
  return (
    <div className='px-4'>
      <div className='mb-3'>
        <span className='body1-bold'>이 근처 다른 유치원은 어때요?</span>
      </div>

      <div className='scrollbar-hide flex gap-5 overflow-x-auto'>
        {recommendedDogSchools.map((dogSchool) => (
          <RecommendedDogSchoolCard key={dogSchool.id} {...dogSchool} />
        ))}
      </div>
    </div>
  );
};
