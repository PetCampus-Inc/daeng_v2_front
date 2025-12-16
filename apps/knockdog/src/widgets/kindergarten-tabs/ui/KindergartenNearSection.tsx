'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { KindergartenNearCard, useKindergartenNearQuery } from '@features/kindergarten-near';
import { useCurrentLocation } from '@shared/lib/geolocation';

interface KindergartenNearSectionProps {
  kindergartenId?: string;
}

const KindergartenNearSection = ({ kindergartenId }: KindergartenNearSectionProps) => {
  const params = useParams<{ id: string }>();
  const id = kindergartenId ?? params?.id;

  if (!id) throw new Error('Company ID is required for near section');

  const { position } = useCurrentLocation();
  const { lng, lat } = position || { lng: 126.883439, lat: 37.511281 };

  const { data: nearKindergartens = [] } = useKindergartenNearQuery(id, lng, lat);

  return (
    <div className='mb-6 px-4'>
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
