const KAKAO_SDK_URL =
  'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';

const loadKakaoSdk = () => {
  return new Promise((resolve, reject) => {
    if (window.Kakao) {
      resolve(window.Kakao);
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${KAKAO_SDK_URL}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => {
        resolve(window.Kakao);
      });

      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');

    script.src = KAKAO_SDK_URL;
    script.async = true;

    script.onload = () => {
      resolve(window.Kakao);
    };

    script.onerror = () => {
      reject(
        new Error('카카오 SDK를 불러오지 못했습니다.'),
      );
    };

    document.head.appendChild(script);
  });
};

export const loginWithKakao = async () => {
  const Kakao = await loadKakaoSdk();

  if (!Kakao.isInitialized()) {
    Kakao.init(
      import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY,
    );
  }

  Kakao.Auth.authorize({
    redirectUri:
      import.meta.env.VITE_KAKAO_REDIRECT_URI,
  });
};