import { ReactNode } from 'react';
import { useInfiniteQuery, type UseInfiniteQueryResult } from '@tanstack/react-query';
import { dogSchoolListOptions, type DogSchoolWithMetaResult, type DogSchoolWithMeta } from '@features/dog-school';
import { createSafeContext } from '@shared/lib/react/useSafeContext';
import { useBasePoint } from '@shared/lib';

interface ProviderProps {
  children: ReactNode;
  bounds: naver.maps.LatLngBounds | null;
  zoomLevel: number;
}

interface DogSchoolSearchContextValue {
  query: UseInfiniteQueryResult<
    {
      pages: DogSchoolWithMetaResult[];
      pageParams: number[];
    },
    Error
  >;
  schoolList: DogSchoolWithMeta[];
}

const [DogSchoolSearchContext, useDogSchoolSearch] =
  createSafeContext<DogSchoolSearchContextValue>('DogSchoolSearchContext');

export function DogSchoolSearchContextImpl({ children, bounds, zoomLevel }: ProviderProps) {
  const { coord: basePoint } = useBasePoint();

  const query = useInfiniteQuery({
    ...dogSchoolListOptions.searchList({
      refPoint: basePoint!,
      bounds: bounds!,
      zoomLevel,
    }),
  });

  const schoolList = query.data?.pages?.flatMap((page) => page.schoolResult.list) || [];

  return <DogSchoolSearchContext value={{ query, schoolList }}>{children}</DogSchoolSearchContext>;
}

export { DogSchoolSearchContextImpl as DogSchoolSearchContext, useDogSchoolSearch };
