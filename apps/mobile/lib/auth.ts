import { login, me } from '@react-native-kakao/user';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

const resolveName = (name: string | null | undefined, email: string | null | undefined) => {
  if (name && name.trim()) return name.trim();
  return email?.split('@')[0] ?? '';
};

const kakaoLogin = async () => {
  try {
    const { idToken } = await login();
    const { email, nickname, profileImageUrl } = await me();
    return { idToken, email: email ?? '', name: resolveName(nickname, email), picture: profileImageUrl ?? '' };
  } catch {
    // 카카오톡 앱 로그인 실패 시, 웹뷰로 로그인
    const { idToken } = await login({ useKakaoAccountLogin: true });
    const { email, nickname, profileImageUrl } = await me();
    return { idToken, email: email ?? '', name: resolveName(nickname, email), picture: profileImageUrl ?? '' };
  }
};

const googleLogin = async () => {
  await GoogleSignin.hasPlayServices();
  const { data } = await GoogleSignin.signIn();

  if (!data) throw new Error('Google 로그인 실패');

  const { idToken, user } = data;

  return {
    idToken,
    name: resolveName(user.name, user.email),
    email: user.email ?? '',
    picture: user.photo ?? '',
  };
};

const appleLogin = async () => {
  const { identityToken, fullName, email } = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  // Apple은 최초 로그인에만 fullName/email을 반환함 (documented behavior).
  // 두 번째 이후 로그인에서는 null이 들어오므로 가능한 값으로 폴백.
  const composedName = [fullName?.givenName, fullName?.familyName].filter(Boolean).join(' ');

  return {
    idToken: identityToken,
    name: resolveName(composedName, email),
    email: email ?? '',
    picture: '',
  };
};

export { kakaoLogin, googleLogin, appleLogin };
