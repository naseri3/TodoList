import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo/logo.png';
import darkLogo from '../assets/logo/logo-dark.png';
import defaultProfile from '../assets/icons/default-profile.png';
import '../styles/Header.css';

function Header({ user }) {
   const navigate = useNavigate();

   const handleProfileClick = () => {
      if (user) {
         navigate('/mypage');
      } else {
         navigate('/login');
      }
   };

   const handleProfileError = (event) => {
      event.currentTarget.onerror = null;
      event.currentTarget.src = defaultProfile;
      event.currentTarget.classList.remove('user-profile-img');
      event.currentTarget.classList.add('default-profile-img');
   };

   return (
      <header className="header">
         <div className="header-logo-wrap">
            <img src={logo} alt="TodoList" className="header_logo header-logo-light" />
            <img src={darkLogo} alt="TodoList" className="header_logo header-logo-dark" />
         </div>

         <button
            type="button"
            className="header_profile-btn"
            onClick={handleProfileClick}
            aria-label={user ? '마이페이지로 이동' : '로그인'}
         >
            <img
               src={user?.profileImage || defaultProfile}
               alt={user ? `${user.name}님의 프로필` : ''}
               className={
                  user?.profileImage
                     ? 'header-profile-img user-profile-img'
                     : 'header-profile-img default-profile-img'
               }
               onError={handleProfileError}
            />
         </button>
      </header>
   );
}

export default Header;
