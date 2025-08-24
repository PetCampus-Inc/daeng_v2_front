'use client';

import { Icon, IconType } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { useLogin } from '../model/use-login';

import { SocialProvider } from '@entities/social';

const BUTTON_STYLE_MAP = {
  KAKAO: {
    text: '카카오톡으로 시작하기',
    icon: 'KakaoLogo',
    styles: 'text-text-primary bg-[#FEE500]',
  },
  GOOGLE: {
    text: '구글로 시작하기',
    icon: 'GoogleLogo',
    styles: 'text-text-primary bg-white border border-line-400',
  },
  APPLE: {
    text: 'Apple로 시작하기',
    icon: 'AppleLogo',
    styles: 'text-text-primary-inverse bg-black',
  },
};

interface LoginButtonProps extends React.ComponentProps<'button'> {
  provider: SocialProvider;
}

export function LoginButton({ className, provider, ...props }: LoginButtonProps) {
  const { login } = useLogin();

  const { text, icon, styles } = BUTTON_STYLE_MAP[provider];

  return (
    <button
      className={cn('flex items-center justify-center gap-1 rounded-lg py-4', styles, className)}
      onClick={() => login(provider)}
      {...props}
    >
      <Icon icon={icon as IconType} />
      <span className='body1-bold w-36'>{text}</span>
    </button>
  );
}
