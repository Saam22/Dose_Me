import React, { useState, useEffect } from 'react';
import LoginPage     from './pages/LoginPage';
import SignUpPage    from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ForgotPasswordFlow from './pages/Forgotpasswordflow';

const DEMO_DOCTOR = {
  email: 'doctor@doseme.com',
  password: '123456',
  fullName: 'د. أحمد محمد',
  phone: '01000000000',
  role: 'doctor',
  specialty: 'أمراض القلب',
  license: 'EG-12345',
  clinic: 'عيادة DoseMe',
  experience: '12',
  createdAt: '2024-01-01T00:00:00.000Z',
};

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

  /* ── Demo doctor account (for testing the doctor portal) ── */
  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem('doseme-users') || '{}');
      if (!users[DEMO_DOCTOR.email]) {
        users[DEMO_DOCTOR.email] = {
          pass: DEMO_DOCTOR.password,
          name: DEMO_DOCTOR.fullName,
          fullName: DEMO_DOCTOR.fullName,
          phone: DEMO_DOCTOR.phone,
          role: DEMO_DOCTOR.role,
          specialty: DEMO_DOCTOR.specialty,
          license: DEMO_DOCTOR.license,
          clinic: DEMO_DOCTOR.clinic,
          experience: DEMO_DOCTOR.experience,
          createdAt: DEMO_DOCTOR.createdAt,
        };
        localStorage.setItem('doseme-users', JSON.stringify(users));
      }
    } catch {}
  }, []);

  const toggleTheme = () => setIsDark(d => !d);

  /* ── Login success (email + full user record) ─ */
  const handleLogin = (email, userData) => {
    const role = userData?.role || 'patient';
    setUser({ ...(userData || {}), email, role });
    setScreen(role === 'doctor' ? 'doctor' : 'dashboard');
  };

  /* ── Sign-up success (receives full profile) ── */
  const handleSignUp = (profileData) => {
    setUser(profileData);
    setScreen(profileData?.role === 'doctor' ? 'doctor' : 'dashboard');
  };
  if (screen === 'forgot-password') {
    return (
      <ForgotPasswordFlow
        onBackToLogin={() => setScreen('login')}
      />
    );
  }
  /* ── Logout ────────────────────────────────── */
  const handleLogout = () => {
    setUser(null);
    setScreen('login');
  };

  if (screen === 'doctor') {
    return (
      <DoctorDashboardPage
        doctor={user}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'profile') {
    return (
      <ProfilePage
        user={user}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        onBack={() => setScreen('dashboard')}
        onOpenSettings={() => setScreen('settings')}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === 'settings') {
    return (
      <SettingsPage
        user={user}
        isDark={isDark}
        onThemeToggle={toggleTheme}
        onBack={() => setScreen('profile')}
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
      onForgotPassword={() => setScreen('forgot-password')}
    />
  );
}
