interface OwnerVerificationOnboardingStep {
  image: string;
  title: string;
  body: string;
}

const ownerVerificationOnboardingSteps: OwnerVerificationOnboardingStep[] = [
  {
    image: '/images/img_owner_onboarding1.webp',
    title: '유치원 등록을 더욱 쉽게',
    body: '똑독에 이미 등록된 유치원이면,\n바로 정보를 불러와요.',
  },
  {
    image: '/images/img_owner_onboarding2.webp',
    title: '보호자 초대를 간편하게',
    body: '유치원 연결 큐알 코드를 공유하면\n보호자가 등록 신청을 할 수 있어요.',
  },
  {
    image: '/images/img_owner_onboarding3.webp',
    title: '등하원은 더 빠르게',
    body: '원생들의 등하원 시간을 기록해\n보호자에게 알릴 수 있어요.',
  },
  {
    image: '/images/img_owner_onboarding4.webp',
    // 좁은 화면에서 줄바꿈이 필요할 때 콤마 뒤에서만 끊기도록, 그 외 공백은 줄바꿈-불가 공백으로 고정
    title: '등하원 기록도, 원생 정보도 한 곳에',
    body: '등록한 원생의 등하원 기록과\n강아지 프로필을 확인할 수 있어요.',
  },
];

export { ownerVerificationOnboardingSteps };
export type { OwnerVerificationOnboardingStep };
