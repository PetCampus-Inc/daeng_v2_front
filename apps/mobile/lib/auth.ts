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
    if (!idToken) throw new Error('Kakao idToken is empty (talk login)');

    const { email, nickname, profileImageUrl } = await me();
    return { idToken, email: email ?? '', name: resolveName(nickname, email), picture: profileImageUrl ?? '' };
  } catch (talkError) {
    console.warn('[auth] Kakao talk login failed, fallback to account login', talkError);

    try {
      // 애뮬에는 카카오톡이 없어서 계정(웹) 로그인으로 폴백
      const { idToken } = await login({ useKakaoAccountLogin: true });
      if (!idToken) throw new Error('Kakao idToken is empty (account login)');

      const { email, nickname, profileImageUrl } = await me();
      return { idToken, email: email ?? '', name: resolveName(nickname, email), picture: profileImageUrl ?? '' };
    } catch (accountError) {
      console.error('[auth] Kakao account login failed', accountError);
      throw accountError;
    }
  }
};

const googleLogin = async () => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { data } = await GoogleSignin.signIn();

  if (!data) throw new Error('Google 로그인 실패: signIn data is null');

  const { idToken, user } = data;

  // webClientId가 Web OAuth 클라이언트가 아니면 idToken이 null로 온다
  if (!idToken) {
    throw new Error(
      'Google idToken is null — EXPO_PUBLIC_ANDROID_CLIENT_ID 가 Web client ID 인지, debug SHA-1 이 Google Cloud에 등록됐는지 확인'
    );
  }

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
