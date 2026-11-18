import React, { useState, useEffect } from 'react';

import '../styles/theme.css';
import './LoginPage.css';

import Background    from '../components/Background';
import ThemeToggle   from '../components/ThemeToggle';
import Logo          from '../components/Logo';
import LoginForm     from '../components/LoginForm';
import HeroSection   from '../components/HeroSection';
import Toast         from '../components/Toast';
import { useToast }  from '../hooks/useToast';
/**
 * LoginPage
 * Top-level page that wires state (theme, toast) and passes
 * callbacks down into the child components.
 */
// في LoginForm.js أو حيث يتم التحقق من تسجيل الدخول
// في أعلى الملف أو داخل المكون

// function validateLogin(email, password) {
//   try {
//     const users = JSON.parse(localStorage.getItem('doseme-users') || '{}');

//     // ✅ التحقق من وجود المستخدم
//     if (!users[email]) {
//       return { success: false, error: 'البريد الإلكتروني غير مسجل' };
//     }

//     // ✅ التحقق من كلمة المرور
//     if (users[email].pass !== password) {
//       return { success: false, error: 'كلمة المرور غير صحيحة' };
//     }

//     return { success: true, user: users[email] };
//   } catch {
//     return { success: false, error: 'حدث خطأ في تسجيل الدخول' };
//   }
// }
export default function LoginPage({ onSuccess, onSignUpClick ,onForgotPassword }) {
  /* ── Theme ─────────────────────────────────── */
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('doseme-theme') === 'dark'; }
    catch { return false; }
  });

  // Sync theme attribute on <html> so CSS vars respond
  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light'
    );
    try { localStorage.setItem('doseme-theme', isDark ? 'dark' : 'light'); }
    catch { /* storage unavailable */ }
  }, [isDark]);

  const toggleTheme = () => setIsDark((d) => !d);

  /* ── Toast ─────────────────────────────────── */
  const { toast, showToast } = useToast();

  /* ── Callbacks for children ────────────────── */
  const handleLoginSuccess = (email, user) => {
    onSuccess?.(email, user);
    // Replace with real navigation / auth logic
    console.info('Logged in as:', email);
  };

  const handleLogoClick = () =>
    showToast('DoseMe – رعاية أذكى، حياة أفضل 💙', '', 3000);

  /* ── Render ────────────────────────────────── */
  return (
    <div className="login-page" dir="rtl">
      {/* Animated canvas behind everything */}
      <Background />

      {/* Floating theme toggle (top-left in LTR coords) */}
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

      {/* Two-column layout */}
      <div className="page-wrapper">

        {/* ── Left panel: login form ─────────── */}
        <section className="login-section">
          <div className="form-inner">
            <Logo onClick={handleLogoClick} />

            <div className="heading-wrap">
              <h2>تسجيل دخول الأطباء والمرضى</h2>
              <p>
                أهلاً بك مجدداً. الرجاء إدخال بياناتك للوصول إلى لوحة التحكم.
              </p>
            </div>

            <LoginForm
              onSuccess={handleLoginSuccess}
              showToast={showToast}
              onSignUpClick={onSignUpClick}
              onForgotPassword={onForgotPassword}
            />
          </div>
        </section>

        {/* ── Right panel: hero ──────────────── */}
        <HeroSection />
      </div>

      {/* Global toast notification */}
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  );
}
