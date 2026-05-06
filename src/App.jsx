import React, { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

/**
 * App
 * Root component
 */
export default function App() {
  const [userEmail, setUserEmail] = useState(() => {
    try {
      return localStorage.getItem('doseme-user-email') || '';
    } catch {
      return '';
    }
  });

  const isLoggedIn = !!userEmail;

  useEffect(() => {
    try {
      if (userEmail) localStorage.setItem('doseme-user-email', userEmail);
      else localStorage.removeItem('doseme-user-email');
    } catch {
      // ignore
    }
  }, [userEmail]);

  if (!isLoggedIn) {
    return <LoginPage onSuccess={(email) => setUserEmail(email)} />;
  }

  return <DashboardPage userEmail={userEmail} onLogout={() => setUserEmail('')} />;
}

