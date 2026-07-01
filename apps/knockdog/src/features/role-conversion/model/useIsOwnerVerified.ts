import { OWNER_VERIFIED_STUB } from '../config/roleConversionVisibility';
import { useUserStore } from '@entities/user';

/** 로그인 + 원장 인증 완료 여부 (퍼블리싱 단계에서는 stub로 UI 확인) */
function useIsOwnerVerified() {
  const user = useUserStore((state) => state.user);

  if (!user) return false;

  // @todo BE 원장 인증 상태 반영
  return OWNER_VERIFIED_STUB;
}

export { useIsOwnerVerified };
