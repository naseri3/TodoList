import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo/logo.png';
import googleIcon from '../assets/icons/google.png';
import kakaoIcon from '../assets/icons/kakao.png';
import naverIcon from '../assets/icons/naver.png';
import { startSocialLogin } from '../api/auth';
import '../styles/login.css';

const Login = ({ onLogin }) => {
   const navigate = useNavigate();
   
   const handleLogin = async (provider) => {
      try {
        const user = await startSocialLogin(provider);
  
        if (user) {
          onLogin(user);
          navigate('/home', { replace: true });
        }
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };
  

   return (
      <main className="login-page">
         <section className="login-container">
            <div className="logo-area">
               <img className="login-logo" src={logo} alt="TodoList" />
            </div>

            <p className="login-description">
               매일 할 일을 더 쉽고 간편하게
            </p>

            <div className="login-buttons">
               <button
                  type="button"
                  className="login-button google"
                  onClick={() => handleLogin('google')}
               >
                  <img className="social-icon" src={googleIcon} alt="" />
                  <span>Google로 시작하기</span>
               </button>

               <button
                  type="button"
                  className="login-button kakao"
                  onClick={() => handleLogin('kakao')}
               >
                  <img className="social-icon" src={kakaoIcon} alt="" />
                  <span>카카오로 시작하기</span>
               </button>

               <button
                  type="button"
                  className="login-button naver"
                  onClick={() => handleLogin('naver')}
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
