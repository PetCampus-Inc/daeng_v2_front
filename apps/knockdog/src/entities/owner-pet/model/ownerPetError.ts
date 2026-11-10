import { ApiError } from '@shared/api';

/**
 * 이 유치원 소속이 아닌 원생의 프로필을 조회할 때 백엔드가 내려주는 코드(403).
 * 연결이 해제된 원생도 같은 코드로 거절된다.
 */
const PET_NOT_AUTHORIZED_CODE = 'PET-403-1';

/** 원생 프로필 조회 실패가 접근 권한 없음(해제된 원생 포함)인지 판별한다 */
const isPetNotAuthorizedError = (error: unknown): boolean =>
  error instanceof ApiError && String(error.code) === PET_NOT_AUTHORIZED_CODE;

export { isPetNotAuthorizedError };
