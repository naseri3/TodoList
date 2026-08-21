import { useNavigate, Link } from 'react-router-dom';

import logo from '../assets/logo/logo.png';
import googleIcon from '../assets/icons/google.png';
import kakaoIcon from '../assets/icons/kakao.png';
import naverIcon from '../assets/icons/naver.png';

import { loginWithGoogle } from '../api/auth/google';
import { loginWithKakao } from '../api/auth/kakao';
import { loginWithNaver } from '../api/auth/naver';

import '../styles/login.css';

const Login = ({ onLogin }) => {
   const navigate = useNavigate();

   const handleGoogleLogin = async () => {
      try {
         const user = await loginWithGoogle();

         if (!user) {
            return;
         }

         onLogin?.(user);
         navigate('/home', { replace: true });
      } catch (error) {
         console.error('Google 로그인 실패:', error);

         alert(
            error instanceof Error
               ? error.message
               : 'Google 로그인에 실패했습니다.'
         );
      }
   };

   const handleKakaoLogin = () => {
      try {
         // 카카오 로그인 페이지로 이동합니다.
         // 로그인 완료 처리는 KakaoCallback에서 수행합니다.
         loginWithKakao();
      } catch (error) {
         console.error('카카오 로그인 시작 실패:', error);

         alert(
            error instanceof Error
               ? error.message
               : '카카오 로그인을 시작하지 못했습니다.'
         );
      }
   };

   const handleNaverLogin = () => {
      try {
         // 로그인 완료 처리는 NaverCallback에서 수행합니다.
         loginWithNaver();
      } catch (error) {
         console.error('네이버 로그인 시작 실패:', error);

         alert(
            error instanceof Error
               ? error.message
               : '네이버 로그인을 시작하지 못했습니다.'
         );
      }
   };

   return (
      <main className="login-page">
         <section className="login-container">
            <div className="logo-area">
               <Link to="/home" aria-label="홈으로 이동">
                  <img className="login-logo" src={logo} alt="TodoList" />
               </Link>
            </div>

            <p className="login-description">매일 할 일을 더 쉽고 간편하게</p>

            <div className="login-buttons">
               <button
                  type="button"
                  className="login-button google"
                  onClick={handleGoogleLogin}
               >
                  <img className="social-icon" src={googleIcon} alt="" />
                  <span>Google로 시작하기</span>
               </button>

               <button
                  type="button"
                  className="login-button kakao"
                  onClick={handleKakaoLogin}
               >
                  <img className="social-icon" src={kakaoIcon} alt="" />
                  <span>카카오로 시작하기</span>
               </button>

               <button
                  type="button"
                  className="login-button naver"
                  onClick={handleNaverLogin}
               >
                  <img
                     className="social-icon naver-icon"
                     src={naverIcon}
                     alt=""
                  />
                  <span>네이버로 시작하기</span>
               </button>
            </div>
         </section>
      </main>
   );
};

export default Login;
