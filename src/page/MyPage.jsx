import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import defaultProfile from '../assets/icons/mdi_user.png';
import profileIcon from '../assets/icons/mdi_user-outline.png';
import logoutIcon from '../assets/icons/material-symbols_logout-rounded.png';
import lightModeIcon from '../assets/icons/material-symbols_light-mode.png';
import deleteIcon from '../assets/icons/material-symbols_delete.png';
import closeIcon from '../assets/icons/close.png';
import errorIcon from '../assets/icons/error.png';
import '../styles/MyPage.css';

const THEME_STORAGE_KEY = 'todoListTheme';

const MyPage = ({ user, onLogout, onProfileImageChange }) => {
   const navigate = useNavigate();
   const profileInputRef = useRef(null);
   const userName =
      user?.name ||
      user?.displayName ||
      user?.nickname ||
      user?.kakao_account?.profile?.nickname ||
      user?.response?.name ||
      '사용자';
   const userEmail =
      user?.email ||
      user?.accountEmail ||
      user?.kakao_account?.email ||
      user?.response?.email ||
      '이메일 정보 없음';
   const [isDarkMode, setIsDarkMode] = useState(
      () => localStorage.getItem(THEME_STORAGE_KEY) === 'dark'
   );
   const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
   const [profilePreview, setProfilePreview] = useState(
      user?.profileImage || defaultProfile
   );

   useEffect(() => {
      document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light';
      localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
   }, [isDarkMode]);

   useEffect(() => {
      if (!isWithdrawalModalOpen) return undefined;

      const closeOnEscape = (event) => {
         if (event.key === 'Escape') setIsWithdrawalModalOpen(false);
      };

      window.addEventListener('keydown', closeOnEscape);
      return () => window.removeEventListener('keydown', closeOnEscape);
   }, [isWithdrawalModalOpen]);

   const handleLogoutClick = async () => {
      try {
         await onLogout();
         navigate('/home', { replace: true });
      } catch (error) {
         console.error('로그아웃 오류:', error);
         alert('로그아웃에 실패했습니다.');
      }
   };

   const handleProfileImageSelect = (event) => {
      const file = event.target.files?.[0];

      if (!file) return;
      if (!file.type.startsWith('image/')) {
         alert('이미지 파일만 선택할 수 있습니다.');
         return;
      }
      const reader = new FileReader();
      reader.onload = () => {
         const selectedImage = reader.result;

         setProfilePreview(selectedImage);
         onProfileImageChange?.(selectedImage);
         event.target.value = '';
      };
      reader.onerror = () => alert('이미지를 불러오지 못했습니다.');
      reader.readAsDataURL(file);
   };

   const handleWithdrawalConfirm = () => {
      setIsWithdrawalModalOpen(false);
      alert('현재 로그인 제공자별 탈퇴 연동을 준비 중입니다.');
   };

   return (
      <main className="mypage">
         <section className="mypage-card" aria-labelledby="mypage-title">
            <div className="mypage-heading">
               <h1 id="mypage-title">회원 정보</h1>
               <button type="button" onClick={() => navigate('/home')} aria-label="마이페이지 닫기">
                  <span
                     className="mypage-close-icon"
                     aria-hidden="true"
                     style={{
                        WebkitMaskImage: `url(${closeIcon})`,
                        maskImage: `url(${closeIcon})`,
                     }}
                  />
               </button>
            </div>

            <div className="mypage-profile">
               <img
                  src={profilePreview}
                  alt=""
                  className="mypage-profile-image"
                  onError={(event) => {
                     event.currentTarget.onerror = null;
                     event.currentTarget.src = defaultProfile;
                  }}
               />
               <div className="mypage-profile-text">
                  <strong>{userName}</strong>
                  <span>{userEmail}</span>
               </div>
            </div>

            <nav className="mypage-menu" aria-label="회원 설정">
               <button type="button" onClick={() => profileInputRef.current?.click()}>
                  <img src={profileIcon} alt="" />
                  <span>프로필 수정</span>
                  <span className="mypage-chevron" aria-hidden="true">›</span>
               </button>
               <input
                  ref={profileInputRef}
                  className="mypage-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageSelect}
                  aria-label="프로필 이미지 선택"
               />

               <button type="button" onClick={handleLogoutClick}>
                  <img src={logoutIcon} alt="" />
                  <span>로그아웃</span>
                  <span className="mypage-chevron" aria-hidden="true">›</span>
               </button>

               <button
                  type="button"
                  role="switch"
                  aria-checked={isDarkMode}
                  onClick={() => setIsDarkMode((current) => !current)}
               >
                  <img src={lightModeIcon} alt="" />
                  <span>다크모드</span>
                  <span className="mypage-mode">[{isDarkMode ? 'ON' : 'OFF'}]</span>
               </button>

               <button type="button" className="mypage-withdrawal" onClick={() => setIsWithdrawalModalOpen(true)}>
                  <img src={deleteIcon} alt="" />
                  <span>회원탈퇴</span>
                  <span className="mypage-chevron" aria-hidden="true">›</span>
               </button>
            </nav>
         </section>

         {isWithdrawalModalOpen && (
            <div
               className="withdrawal-modal-backdrop"
               onMouseDown={() => setIsWithdrawalModalOpen(false)}
            >
               <div
                  className="withdrawal-modal"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="withdrawal-modal-title"
                  aria-describedby="withdrawal-modal-description"
                  onMouseDown={(event) => event.stopPropagation()}
               >
                  <img src={errorIcon} alt="" className="withdrawal-modal-icon" />
                  <p id="withdrawal-modal-description">
                     <strong id="withdrawal-modal-title">회원 탈퇴</strong> 시<br />
                     작성인의 모든 리스트와 할일이<br />
                     완전히 삭제됩니다.
                  </p>
                  <div className="withdrawal-modal-actions">
                     <button type="button" onClick={() => setIsWithdrawalModalOpen(false)} autoFocus>취소</button>
                     <button type="button" onClick={handleWithdrawalConfirm}>탈퇴</button>
                  </div>
               </div>
            </div>
         )}
      </main>
   );
};

export default MyPage;
