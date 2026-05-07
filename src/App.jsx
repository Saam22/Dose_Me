import React, { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import './styles/global.css';

/**
 * App - Root Component
 */
export default function App() {
  // ── Theme State ───────────────────────────
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('doseme-theme') === 'dark';
    } catch {
      return false;
    }
  });

  // ── Navigation State ──────────────────────
  const [currentPage, setCurrentPage] = useState('login');
  
  // ── Authentication State ──────────────────
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState(null);
  
  // ── Loading State ─────────────────────────
  const [isLoading, setIsLoading] = useState(true);

  // ── Apply Theme to Document ───────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try {
      localStorage.setItem('doseme-theme', isDark ? 'dark' : 'light');
    } catch { /* ignore */ }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // ── Load Data from localStorage on Mount ─
  useEffect(() => {
    const loadData = () => {
      try {
        // Load email
        const savedEmail = localStorage.getItem('doseme-user-email');
        if (savedEmail) {
          setUserEmail(savedEmail);
          
          // Load profile data
          const savedProfile = localStorage.getItem('doseme-user-profile');
          if (savedProfile) {
            setUserData(JSON.parse(savedProfile));
            setCurrentPage('dashboard');
          } else {
            // No profile data, go to signup
            setCurrentPage('signup');
          }
        } else {
          // No email, stay on login
          setCurrentPage('login');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setCurrentPage('login');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // ── Persist Auth State ────────────────────
  useEffect(() => {
    try {
      if (userEmail) {
        localStorage.setItem('doseme-user-email', userEmail);
      } else {
        localStorage.removeItem('doseme-user-email');
      }
    } catch { /* ignore */ }
  }, [userEmail]);

  // ── Persist User Profile ──────────────────
  useEffect(() => {
    try {
      if (userData) {
        localStorage.setItem('doseme-user-profile', JSON.stringify(userData));
      } else {
        localStorage.removeItem('doseme-user-profile');
      }
    } catch { /* ignore */ }
  }, [userData]);

  // ── Navigation Handlers ───────────────────
  const navigateTo = (page) => setCurrentPage(page);

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    navigateTo('dashboard');
  };

  const handleSignUpSuccess = (profileData) => {
    setUserData(profileData);
    setUserEmail(profileData.email);
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    setUserEmail('');
    setUserData(null);
    navigateTo('login');
  };

  const handleUpdateProfile = (updatedData) => {
    setUserData(prev => ({ ...prev, ...updatedData }));
  };

  // ── Show Loading Screen ───────────────────
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>جاري تحميل البيانات...</p>
      </div>
    );
  }

  // ── Render Active Page ────────────────────
  return (
    <div className="app-root" data-theme={isDark ? 'dark' : 'light'}>
      {/* Global Theme Toggle */}
      <GlobalThemeToggle isDark={isDark} onToggle={toggleTheme} />
      {currentPage === 'signup' && (
        <SignUpPage 
          onSuccess={handleSignUpSuccess}
          onSwitchToLogin={() => navigateTo('login')}
        />
      )}
      {/* Page Router */}
      {currentPage === 'login' && (
        <LoginPage 
          onSuccess={handleLoginSuccess}
          onSwitchToSignUp={() => navigateTo('dashboard')}
        />
      )}

 

      {currentPage === 'dashboard' && (
        <DashboardPage 
          userEmail={userEmail}
          userData={userData}
          onLogout={handleLogout}
          onViewProfile={() => navigateTo('profile')}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {currentPage === 'profile' && userData && (
        <ProfilePage 
          userData={userData}
          onUpdateProfile={handleUpdateProfile}
          onBack={() => navigateTo('dashboard')}
        />
      )}
    </div>
  );
}

/**
 * GlobalThemeToggle - Floating button
 */
function GlobalThemeToggle({ isDark, onToggle }) {
  return (
    <button 
      className="global-theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      title={isDark ? 'الوضع الفاتح ☀️' : 'الوضع الداكن 🌙'}
    >
      <span className="material-symbols-outlined">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}