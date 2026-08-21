import { loginWithGoogle } from './auth/google.js';
import { loginWithKakao } from './auth/kakao.js';
import { loginWithNaver } from './auth/naver.js';

export const startSocialLogin = async (provider) => {
  switch (provider) {
    case 'google':
      return loginWithGoogle();

    case 'kakao':
      return loginWithKakao();

    case 'naver':
      return loginWithNaver();

    default:
      throw new Error(
        `지원하지 않는 로그인 방식입니다: ${provider}`,
      );
  }
};