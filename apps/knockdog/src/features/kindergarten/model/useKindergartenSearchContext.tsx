import { ReactNode } from 'react';
import { type UseInfiniteQueryResult } from '@tanstack/react-query';
import { DogSchoolWithMeta, DogSchoolWithMetaResult } from './mappers';
import { useKindergartenSearchListQuery } from '../api/useKindergartenQuery';
import { createSafeContext } from '@shared/lib/react/useSafeContext';
import { useBasePoint } from '@shared/lib';

interface ProviderProps {
  children: ReactNode;
  bounds: naver.maps.LatLngBounds | null;
  zoomLevel: number;
}

interface KindergartenSearchContextValue {
  query: UseInfiniteQueryResult<
    {
      pages: DogSchoolWithMetaResult[];
      pageParams: number[];
    },
    Error
  >;
  schoolList: DogSchoolWithMeta[];
}

const [KindergartenSearchContext, useKindergartenSearch] =
  createSafeContext<KindergartenSearchContextValue>('KindergartenSearchContext');

export function KindergartenSearchContextImpl({ children, bounds, zoomLevel }: ProviderProps) {
  const { coord: basePoint } = useBasePoint();

  const query = useKindergartenSearchListQuery({
    refPoint: basePoint!,
    bounds: bounds!,
    zoomLevel,
  });

  const schoolList = query.data?.pages?.flatMap((page) => page.schoolResult.list) || [];

  return <KindergartenSearchContext value={{ query, schoolList }}>{children}</KindergartenSearchContext>;
}

export { KindergartenSearchContextImpl as KindergartenSearchContext, useKindergartenSearch };
