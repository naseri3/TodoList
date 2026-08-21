import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { validateNaverOAuthState } from '../api/auth/naver';

const NaverCallback = ({ onLogin }) => {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const processedRef = useRef(false);

   useEffect(() => {
      if (processedRef.current) {
         return;
      }

      processedRef.current = true;

      try {
         const code = searchParams.get('code');
         const state = searchParams.get('state');
         const error = searchParams.get('error');
         const errorDescription = searchParams.get('error_description');

         if (error) {
            throw new Error(
               errorDescription || '네이버 로그인이 취소되었습니다.'
            );
         }

         if (!code) {
            throw new Error('네이버 인가 코드를 받지 못했습니다.');
         }

         if (!validateNaverOAuthState(state)) {
            throw new Error('네이버 로그인 요청 정보가 일치하지 않습니다.');
         }

         /*
          * 화면 이동을 확인하기 위한 임시 사용자입니다.
          * 실제 사용자 정보는 백엔드 토큰 교환 후 받아야 합니다.
          */
         const temporaryUser = {
            id: `naver-${Date.now()}`,
            name: '네이버 사용자',
            email: null,
            provider: 'naver',
         };

         onLogin?.(temporaryUser);

         navigate('/home', {
            replace: true,
         });
      } catch (error) {
         console.error('네이버 로그인 처리 실패:', error);

         alert(
            error instanceof Error
               ? error.message
               : '네이버 로그인 처리에 실패했습니다.'
         );

         navigate('/login', {
            replace: true,
         });
      }
   }, [navigate, onLogin, searchParams]);

   return (
      <main>
         <p>네이버 로그인 처리 중...</p>
      </main>
   );
};

export default NaverCallback;
