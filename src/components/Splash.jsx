import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import splashLogo from '../assets/logo/splashLogo.png';

const Splash = () => {
   const navigate = useNavigate();

   useEffect(() => {
      const timer = window.setTimeout(() => {
         navigate('/home', { replace: true });
      }, 1000);

      return () => window.clearTimeout(timer);
   }, [navigate]);

   return (
      <main className="splash">
         <img src={splashLogo} alt="TodoList Logo" />
      </main>
   );
};

export default Splash;
