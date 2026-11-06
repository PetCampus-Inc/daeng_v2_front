type SocialLoginResult = {
  idToken: string;
  email: string;
  // 네이티브 측에서 항상 채워서 보내야 함. 값이 없으면 빈 문자열로 보내 백엔드 폴백을 유도.
  name: string;
  picture?: string;
};

export type { SocialLoginResult };
