import { login, me } from '@react-native-kakao/user';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

const kakaoLogin = async () => {
  try {
    const { idToken } = await login();
    const { email, nickname, profileImageUrl } = await me();

    return {
      idToken,
      email,
      name: nickname,
      picture: profileImageUrl,
    };
  } catch (error) {
    console.error(error);
  }
};

const googleLogin = async () => {
  try {
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
  } catch (error) {
    console.error(error);
  }
};

const appleLogin = async () => {
  try {
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
  } catch (err) {
    console.error(err);
  }
};

export { kakaoLogin, googleLogin, appleLogin };
