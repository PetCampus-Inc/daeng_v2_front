import { login, me } from '@react-native-kakao/user';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

const kakaoLogin = async () => {
  try {
    const { idToken } = await login();
    const { email, nickname, profileImageUrl } = await me();
    return { idToken, email, name: nickname, picture: profileImageUrl };
  } catch {
    // 카카오톡 앱 로그인 실패 시, 웹뷰로 로그인
    const { idToken } = await login({ useKakaoAccountLogin: true });
    const { email, nickname, profileImageUrl } = await me();
    return { idToken, email, name: nickname, picture: profileImageUrl };
  }
};

const googleLogin = async () => {
  await GoogleSignin.hasPlayServices();
  const { data } = await GoogleSignin.signIn();

  if (!data) throw new Error('Google 로그인 실패');

  const { idToken, user } = data;

  return {
    idToken,
    name: user.name,
    email: user.email,
    picture: user.photo,
  };
};

const appleLogin = async () => {
  const { identityToken, fullName, email } = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  return {
    idToken: identityToken,
    name: fullName?.givenName + ' ' + fullName?.familyName,
    email,
    picture: '',
  };
};

export { kakaoLogin, googleLogin, appleLogin };
