import { queryOptions } from '@tanstack/react-query';
import { getKindergartenBasic, type KindergartenBasicParams } from '../api/kindergarten-basic';
import { getKindergartenMain, type KindergartenMainParams } from '../api/kindergarten-main';

export const kindergartenQueries = {
  keys: {
    all: () => ['kindergarten'] as const,
    main: (params: KindergartenMainParams) =>
      [...kindergartenQueries.keys.all(), 'main', params.id, { lat: params.lat, lng: params.lng }] as const,
    basic: (params: KindergartenBasicParams) => [...kindergartenQueries.keys.all(), 'basic', params.id] as const,
  },

  main: (params: KindergartenMainParams) =>
    queryOptions({
      queryKey: kindergartenQueries.keys.main(params),
      queryFn: () => getKindergartenMain(params),
    }),

  basic: (params: KindergartenBasicParams) =>
    queryOptions({
      queryKey: kindergartenQueries.keys.basic(params),
      queryFn: () => getKindergartenBasic(params),
    }),
};
