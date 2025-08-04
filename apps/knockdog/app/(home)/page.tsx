'use client';

import { Suspense } from 'react';
import { MapWithSchools } from '@widgets/map-with-schools';

export default function Home() {
  return (
    <Suspense>
      <MapWithSchools />
    </Suspense>
  );
}
