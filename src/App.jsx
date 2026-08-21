import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import Splash from './components/Splash';
import Home from './page/Home';
import TodoList from './page/TodoList';
import Login from './page/Login';
import MyPage from './page/MyPage';
import KakaoCallback from './page/KakaoCallback';
import NaverCallback from './page/NaverCallback';

import { logout } from './api/auth/logout.js';
import { firebaseAuth } from './api/firebase.js';

import customProfileImage from './assets/image/IMG_4633.PNG';

import './App.css';

const SOCIAL_USER_STORAGE_KEY = 'socialLoginUser';
const PROFILE_IMAGE_STORAGE_KEY = 'todoListProfileImages';
const THEME_STORAGE_KEY = 'todoListTheme';
const PROFILE_DB_NAME = 'todoListProfileDB';
const PROFILE_STORE_NAME = 'profileImages';

const getUserStorageKey = (user) => user?.id || user?.email || user?.provider || 'user';

const openProfileDatabase = () => new Promise((resolve, reject) => {
   const request = indexedDB.open(PROFILE_DB_NAME, 1);

   request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROFILE_STORE_NAME)) {
         database.createObjectStore(PROFILE_STORE_NAME);
      }
   };
   request.onsuccess = () => resolve(request.result);
   request.onerror = () => reject(request.error);
});

const readSavedProfileImage = async (userId) => {
   try {
      const database = await openProfileDatabase();
      const image = await new Promise((resolve, reject) => {
         const request = database
            .transaction(PROFILE_STORE_NAME, 'readonly')
            .objectStore(PROFILE_STORE_NAME)
            .get(userId);

         request.onsuccess = () => resolve(request.result || '');
         request.onerror = () => reject(request.error);
      });
      database.close();

      if (image) return image;

      // 기존 localStorage에 저장된 이미지가 있다면 한 번만 불러옵니다.
      const legacyImages = JSON.parse(localStorage.getItem(PROFILE_IMAGE_STORAGE_KEY)) || {};
      return legacyImages[userId] || '';
   } catch (error) {
      console.error('프로필 이미지 불러오기 실패:', error);
      return '';
   }
};

const saveProfileImage = async (userId, profileImage) => {
   const database = await openProfileDatabase();

   await new Promise((resolve, reject) => {
      const request = database
         .transaction(PROFILE_STORE_NAME, 'readwrite')
         .objectStore(PROFILE_STORE_NAME)
         .put(profileImage, userId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
   });

   database.close();
};

function App() {
   const [user, setUser] = useState(null);
   const [authLoading, setAuthLoading] = useState(true);

   useEffect(() => {
      document.documentElement.dataset.theme =
         localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
         if (firebaseUser) {
            const savedProfileImage = await readSavedProfileImage(firebaseUser.uid);
            const firebaseLoginUser = {
               id: firebaseUser.uid,
               name: firebaseUser.displayName || 'Google 사용자',
               email: firebaseUser.email,
               profileImage: savedProfileImage || customProfileImage,
               provider: 'google',
            };

            setUser(firebaseLoginUser);
            setAuthLoading(false);
            return;
         }

         /*
          * Firebase 사용자가 없다면
          * 카카오·네이버 로그인 정보를 확인합니다.
          */
         const savedSocialUser = localStorage.getItem(SOCIAL_USER_STORAGE_KEY);

         if (savedSocialUser) {
            try {
               const socialUser = JSON.parse(savedSocialUser);
               const savedProfileImage = await readSavedProfileImage(
                  getUserStorageKey(socialUser)
               );
               setUser({
                  ...socialUser,
                  profileImage: savedProfileImage || socialUser.profileImage || customProfileImage,
               });
            } catch (error) {
               console.error('소셜 로그인 정보 복원 실패:', error);

               localStorage.removeItem(SOCIAL_USER_STORAGE_KEY);

               setUser(null);
            }
         } else {
            setUser(null);
         }

         setAuthLoading(false);
      });

      return () => unsubscribe();
   }, []);

   const handleLogin = (loginUser) => {
      const normalizedUser = {
         ...loginUser,
         profileImage: loginUser.profileImage || customProfileImage,
      };

      setUser(normalizedUser);

      /*
       * 카카오·네이버 사용자는 아직 Firebase Auth에
       * 연결되지 않았으므로 브라우저에 임시 저장합니다.
       */
      if (loginUser.provider !== 'google') {
         localStorage.setItem(
            SOCIAL_USER_STORAGE_KEY,
            JSON.stringify(normalizedUser)
         );
      }
   };

   const handleLogout = async () => {
      try {
         await logout();

         localStorage.removeItem(SOCIAL_USER_STORAGE_KEY);

         setUser(null);
      } catch (error) {
         console.error('로그아웃 오류:', error);
         alert('로그아웃에 실패했습니다.');
      }
   };

   const handleProfileImageChange = (profileImage) => {
      setUser((currentUser) => {
         if (!currentUser) return currentUser;

         const updatedUser = { ...currentUser, profileImage };
         const userStorageKey = getUserStorageKey(currentUser);

         saveProfileImage(userStorageKey, profileImage).catch((error) => {
            console.error('프로필 이미지 저장 실패:', error);
         });

         try {
            if (currentUser.provider !== 'google') {
               localStorage.setItem(
                  SOCIAL_USER_STORAGE_KEY,
                  JSON.stringify({ ...updatedUser, profileImage: '' })
               );
            }
         } catch (error) {
            console.error('소셜 로그인 정보 저장 실패:', error);
         }

         return updatedUser;
      });
   };

   if (authLoading) {
      return <div>로그인 상태 확인 중...</div>;
   }

   return (
      <BrowserRouter>
         <Routes>
            {/* 시작 화면 */}
            <Route path="/" element={<Splash />} />

            {/* 홈 */}
            <Route path="/home" element={<Home user={user} />} />

            {/* 폴더별 할 일 목록 */}
            <Route path="/folder/:folderId" element={<TodoList user={user} />} />

            {/* 로그인 */}
            <Route
               path="/login"
               element={
                  user ? (
                     <Navigate to="/home" replace />
                  ) : (
                     <Login onLogin={handleLogin} />
                  )
               }
            />

            {/* 카카오 로그인 콜백 */}
            <Route
               path="/oauth/kakao/callback"
               element={<KakaoCallback onLogin={handleLogin} />}
            />

            {/* 네이버 로그인 콜백 */}
            <Route
               path="/oauth/naver/callback"
               element={<NaverCallback onLogin={handleLogin} />}
            />

            {/* 마이페이지 */}
            <Route
               path="/mypage"
               element={
                  user ? (
                     <MyPage
                        user={user}
                        onLogout={handleLogout}
                        onProfileImageChange={handleProfileImageChange}
                     />
                  ) : (
                     <Navigate to="/login" replace />
                  )
               }
            />

            {/* 존재하지 않는 주소 */}
            <Route path="*" element={<Navigate to="/home" replace />} />
         </Routes>
      </BrowserRouter>
   );
}

export default App;
