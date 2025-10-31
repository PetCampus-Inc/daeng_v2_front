/**
 * UserAgent를 통해 네이티브의 웹뷰 환경인지 확인합니다.
 * @returns 웹뷰 환경 여부
 */
export const isNative = () => {
  const USER_AGENT_NAME = process.env.NEXT_PUBLIC_NATIVE_USER_AGENT;
  if (!USER_AGENT_NAME) return false;

  return window.navigator.userAgent.includes(USER_AGENT_NAME);
};
