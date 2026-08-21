import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { validateKakaoOAuthState } from '../api/auth/kakao';

const KakaoCallback = ({ onLogin }) => {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const processedRef = useRef(false);

   useEffect(() => {
      // React StrictMode에서 중복 실행되는 것을 방지합니다.
      if (processedRef.current) {
         return;
      }

      processedRef.current = true;

      const processKakaoCallback = () => {
         try {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            if (error) {
               throw new Error(
                  errorDescription || '카카오 로그인이 취소되었습니다.'
               );
            }

            if (!code) {
               throw new Error('카카오 인가 코드를 전달받지 못했습니다.');
            }

            if (!validateKakaoOAuthState(state)) {
               throw new Error('카카오 로그인 요청 정보가 일치하지 않습니다.');
            }

            /*
             * 현재는 화면 이동을 확인하기 위한 임시 사용자입니다.
             * 다음 단계에서 code를 백엔드로 보내고,
             * 실제 카카오 사용자 정보로 교체해야 합니다.
             */
            const temporaryUser = {
               provider: 'kakao',
               authorizationCode: code,
            };

            onLogin?.(temporaryUser);

            navigate('/home', {
               replace: true,
            });
         } catch (error) {
            console.error('카카오 로그인 처리 실패:', error);

            alert(
               error instanceof Error
                  ? error.message
                  : '카카오 로그인 처리에 실패했습니다.'
            );

            navigate('/login', {
               replace: true,
            });
         }
      };

      processKakaoCallback();
   }, [navigate, onLogin, searchParams]);

   return (
      <main className="oauth-callback-page">
         <p>카카오 로그인 처리 중...</p>
      </main>
   );
};

export default KakaoCallback;
