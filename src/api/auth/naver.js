const naverClientId = import.meta.env.VITE_NAVER_CLIENT_ID;

const naverCallbackUrl = import.meta.env.VITE_NAVER_CALLBACK_URL;

const NAVER_AUTHORIZE_URL = 'https://nid.naver.com/oauth2.0/authorize';

const NAVER_OAUTH_STATE_KEY = 'naver_oauth_state';

const createOAuthState = () => {
   const randomValues = new Uint32Array(4);

   window.crypto.getRandomValues(randomValues);

   return Array.from(randomValues, (value) =>
      value.toString(16).padStart(8, '0')
   ).join('');
};

export const loginWithNaver = () => {
   if (!naverClientId) {
      throw new Error('VITE_NAVER_CLIENT_ID가 설정되지 않았습니다.');
   }

   if (!naverCallbackUrl) {
      throw new Error('VITE_NAVER_CALLBACK_URL이 설정되지 않았습니다.');
   }

   const state = createOAuthState();

   sessionStorage.setItem(NAVER_OAUTH_STATE_KEY, state);

   const params = new URLSearchParams({
      response_type: 'code',
      client_id: naverClientId,
      redirect_uri: naverCallbackUrl,
      state,
   });

   window.location.assign(`${NAVER_AUTHORIZE_URL}?${params.toString()}`);
};

export const validateNaverOAuthState = (receivedState) => {
   const savedState = sessionStorage.getItem(NAVER_OAUTH_STATE_KEY);

   sessionStorage.removeItem(NAVER_OAUTH_STATE_KEY);

   return Boolean(receivedState && savedState && receivedState === savedState);
};
