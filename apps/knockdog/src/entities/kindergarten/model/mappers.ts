import type { Kindergarten } from './kindergarten';
import type { KindergartenMain } from './types';
import { formatDistance } from '@shared/lib';

/**
 * Kindergarten DTO를 도메인 모델로 가공하는 함수
 */
export function toKindergartenMain(data: Kindergarten): KindergartenMain {
  const { dist, ...rest } = data;
  return {
    ...rest,
    dist: formatDistance(dist, { unit: 'kilometer' }),
  };
}
