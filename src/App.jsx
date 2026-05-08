import React, { useState, useEffect } from 'react';
import LoginPage     from './pages/LoginPage';
import SignUpPage    from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage   from './pages/ProfilePage';

/**
 * App
 * screens: 'login' | 'signup' | 'dashboard' | 'profile'
 */
export default function App() {
  const [screen, setScreen] = useState('login');
  const [user,   setUser]   = useState(null);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('doseme-theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('doseme-theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  const toggleTheme = () => setIsDark(d => !d);

  /* ── Login success ─────────────────────────── */
  const handleLogin = (email) => {
    setUser(prev => ({ ...(prev || {}), email }));
    setScreen('dashboard');
  };

  /* ── Sign-up success (receives full profile) ── */
  const handleSignUp = (profileData) => {
    setUser(profileData);
    setScreen('dashboard');
  };

  /* ── Logout ────────────────────────────────── */
  const handleLogout = () => {
    setUser(null);
    setScreen('login');
  };

  if (screen === 'profile') {
    return (
      <ProfilePage
        user={user}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        onBack={() => setScreen('dashboard')}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'dashboard') {
    return (
      <DashboardPage
        userEmail={user?.email || ''}
        userFullName={user?.fullName || ''}
        onLogout={handleLogout}
        onProfileClick={() => setScreen('profile')}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignUpPage
        onSuccess={handleSignUp}
        onLoginClick={() => setScreen('login')}
      />
    );
  }

  return (
    <LoginPage
      onSuccess={handleLogin}
      onSignUpClick={() => setScreen('signup')}
    />
  );
}
