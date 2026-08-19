import { ApiResponse, api } from '@shared/api';

/** `POST` - 로그인 API */
export const postLogin = async <T>(): Promise<ApiResponse<T>> => {
  return await api.post('auth/login').json<ApiResponse<T>>();
};

interface LogoutRequest {
  pushDeviceId?: string;
}

/** `POST` - 현재 세션을 종료하고 해당 세션의 푸시 기기 등록을 해제한다. */
export const postLogout = async (body?: LogoutRequest) => {
  return body ? await api.post('auth/logout', { json: body }) : await api.post('auth/logout');
};

/** `POST` - 엑세스 토큰 재발급 API */
export const postTokenReissue = async () => {
  return await api.post('auth/refresh');
};

/** `GET` - DEV 로그인 API (게스트 둘러보기 진입에 사용) */
export const fetchDevLogin = async <T>(): Promise<ApiResponse<T>> => {
  // 게스트 전용 ACTIVE 계정. 기존 id=46이 2026-05-28 WITHDRAWN 처리되어 교체.
  // BE 별도 트랙으로 /auth/dev/* 차단 + /auth/guest 신설 예정 → 그때 엔드포인트 교체.
  // DEV_LOGIN_ID = 70 은 2026-06-19 추가됨, 기존 69는 WITHDRAWN 처리되어 임시로 로컬 테스트를 위해 교체.
  // 79번은 isOwner = true, schoolId = 83 으로 원장 마이페이지 테스트하면 됨. => 탈퇴 상태 26.07.16
  const DEV_LOGIN_ID = 96;
  return await api.get(`auth/dev/${DEV_LOGIN_ID}`).json<ApiResponse<T>>();
};
