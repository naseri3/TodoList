const kakaoRestApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;

const kakaoRedirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

const KAKAO_AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize';

const KAKAO_OAUTH_STATE_KEY = 'kakao_oauth_state';

const createOAuthState = () => {
   const randomValues = new Uint32Array(4);

   window.crypto.getRandomValues(randomValues);

   return Array.from(randomValues, (value) =>
      value.toString(16).padStart(8, '0')
   ).join('');
};

export const loginWithKakao = () => {
   if (!kakaoRestApiKey) {
      throw new Error('VITE_KAKAO_REST_API_KEY가 설정되지 않았습니다.');
   }

   if (!kakaoRedirectUri) {
      throw new Error('VITE_KAKAO_REDIRECT_URI가 설정되지 않았습니다.');
   }

   const state = createOAuthState();

   sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state);

   const params = new URLSearchParams({
      client_id: kakaoRestApiKey,
      redirect_uri: kakaoRedirectUri,
      response_type: 'code',
      state,
   });

   window.location.href = `${KAKAO_AUTHORIZE_URL}?${params.toString()}`;
};

export const validateKakaoOAuthState = (receivedState) => {
   const savedState = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY);

   sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY);

   return Boolean(receivedState && savedState && receivedState === savedState);
};
