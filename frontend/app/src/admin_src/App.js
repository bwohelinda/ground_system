import React, { useState, useEffect } from 'react';
import Admin from './Admin';
import Login from './Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return <Admin onLogout={handleLogout} />;
  }

  return <Login onLogin={handleLogin} />;
}

export default App;
