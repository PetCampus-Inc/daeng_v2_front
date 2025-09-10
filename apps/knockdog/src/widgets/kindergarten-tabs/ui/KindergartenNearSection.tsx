'use client';

import React from 'react';

import { KindergartenNearCard, useKindergartenNearQuery } from '@features/kindergarten-near';
import { useParams } from 'next/navigation';
import { useCurrentLocation } from '@shared/lib/geolocation';

const KindergartenNearSection = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) throw new Error('Company ID is required for kindergarten near section');
  // 현재 위치 구하는 hook 추가
  const position = useCurrentLocation();
  const { lng, lat } = position || { lng: 126.883439, lat: 37.511281 };

  const { data: nearKindergartens = [] } = useKindergartenNearQuery(id, lng, lat);

  return (
    <div className='px-4'>
      <div className='mb-3'>
        <span className='body1-bold'>이 근처 다른 유치원은 어때요?</span>
      </div>

      <div className='scrollbar-hide flex gap-5 overflow-x-auto'>
        {nearKindergartens.map((dogSchool) => (
          <KindergartenNearCard key={dogSchool.id} {...dogSchool} />
        ))}
      </div>
    </div>
  );
};

export { KindergartenNearSection };
