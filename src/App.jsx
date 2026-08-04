import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Splash from './components/Splash';
import Home from './page/Home';
import Login from './page/Login';
import './App.css';

function App() {
   const [user, setUser] = useState(null);

   const handleLogin = (loginUser) => {
      setUser(loginUser);
   };

   return (
      <BrowserRouter>
         <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/home" element={<Home user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
         </Routes>
      </BrowserRouter>
   );
}

export default App;
