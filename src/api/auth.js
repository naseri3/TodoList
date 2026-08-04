import { loginWithGoogle } from '/src/api/auth/google';
import { loginWithKakao } from '/src/api/auth/kakao';

export const startSocialLogin = async (provider) => {
  switch (provider) {
    case 'google':
      return loginWithGoogle();

    case 'kakao':
      return loginWithKakao();

    case 'naver':
      throw new Error(
        '네이버 로그인 코드는 아직 준비되지 않았습니다.',
      );

    default:
      throw new Error(
        '지원하지 않는 로그인 방식입니다.',
      );
  }
};