import React, { useState, useRef } from 'react';
import './LoginForm.css';

/**
 * ── دالة التحقق من بيانات المستخدم ──
 */
function validateLoginCredentials(email, password) {
  try {
    const users = JSON.parse(localStorage.getItem('doseme-users') || '{}');

    // ✅ التحقق من وجود المستخدم
    if (!users[email]) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل في النظام' };
    }

    // ✅ التحقق من كلمة المرور
    if (users[email].pass !== password) {
      return { success: false, error: 'كلمة المرور غير صحيحة' };
    }

    return { success: true, user: users[email] };
  } catch {
    return { success: false, error: 'حدث خطأ في تسجيل الدخول' };
  }
}

/**
 * LoginForm
 * Props:
 *   onSuccess {function(email, user)} – called after a successful login
 *   showToast {function(msg, type?, duration?)} – from useToast hook
 */
export default function LoginForm({ onSuccess, showToast, onSignUpClick, onForgotPassword }) {
  /* ── State ─────────────────────────────────── */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pwVisible, setPwVisible] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passError, setPassError] = useState(false);
  const [btnState, setBtnState] = useState('idle'); // 'idle' | 'loading' | 'success'

  const btnRef = useRef(null);

  /* ── Validation helpers ────────────────────── */
  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const validatePass = (v) => v.length >= 6;

  /* ── Input handlers ────────────────────────── */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(false);
  };
  const handlePassChange = (e) => {
    setPassword(e.target.value);
    if (passError) setPassError(false);
  };
  const handleEmailBlur = () => {
    if (email) setEmailError(!validateEmail(email));
  };
  const handlePassBlur = () => {
    if (password) setPassError(!validatePass(password));
  };

  /* ── Submit ────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const eOk = validateEmail(email);
    const pOk = validatePass(password);
    setEmailError(!eOk);
    setPassError(!pOk);

    if (!eOk || !pOk) {
      showToast('يرجى تصحيح الأخطاء أولاً', 'error');
      return;
    }

    setBtnState('loading');

    // ✅ محاكاة تأخير الشبكة
    await new Promise((r) => setTimeout(r, 1500));

    // ✅ التحقق من بيانات الاعتماد
    const result = validateLoginCredentials(email, password);

    if (!result.success) {
      setBtnState('idle');
      showToast(result.error, 'error', 4000);
      setPassError(true);
      return;
    }

    // ✅ تسجيل دخول ناجح
    setBtnState('success');
    const userName = result.user.name || result.user.fullName || 'المستخدم';
    showToast(`🎉 مرحباً ${userName}! تم تسجيل الدخول بنجاح`, 'success', 4000);

    setTimeout(() => {
      onSuccess?.(email, result.user);
      setBtnState('idle');
    }, 1500);
  };

  /* ── Ripple effect (DOM mutation is fine here) */
  const handleRipple = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute; border-radius:50%;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background:rgba(255,255,255,0.25);
      transform:scale(0);
      animation:rippleOut 0.6s ease forwards;
      pointer-events:none;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };

  /* ── Render ────────────────────────────────── */
  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate dir="rtl">

      {/* ── Email ─────────────────────────── */}
      <div className="field-group">
        <label className="field-label" htmlFor="email">
          البريد الإلكتروني المهني
        </label>
        <div className="input-wrap">
          <input
            id="email"
            type="email"
            className={`field-input ${emailError ? 'error-state' : ''}`}
            placeholder="example@clinic.com"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
          />
          <span className="input-icon material-symbols-outlined">mail</span>
        </div>
        <p className={`error-msg ${emailError ? 'show' : ''}`}>
          الرجاء إدخال بريد إلكتروني صحيح
        </p>
      </div>

      {/* ── Password ──────────────────────── */}
      <div className="field-group">
        <label className="field-label" htmlFor="password">
          كلمة المرور
        </label>
        <div className="input-wrap">
          <input
            id="password"
            type={pwVisible ? 'text' : 'password'}
            className={`field-input ${passError ? 'error-state' : ''}`}
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={handlePassChange}
            onBlur={handlePassBlur}
          />
          <span className="input-icon material-symbols-outlined">lock</span>
          <button
            type="button"
            className="toggle-pw"
            aria-label="إظهار / إخفاء كلمة المرور"
            onClick={() => setPwVisible((v) => !v)}
          >
            <span className="material-symbols-outlined">
              {pwVisible ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        <p className={`error-msg ${passError ? 'show' : ''}`}>
          كلمة المرور يجب أن تكون 6 أحرف على الأقل
        </p>
      </div>

      {/* ── Extras row ────────────────────── */}
      <div className="extras-row">
        <button
          type="button"
          className="forgot-link"
          onClick={() => onForgotPassword?.()}
        >
          نسيت كلمة المرور؟
        </button>

        <div className="remember-wrap">
          <span className="remember-label">تذكرني على هذا الجهاز</span>
          <label className="switch-wrap" aria-label="تذكرني">
            <input
              type="checkbox"
              className="switch-input"
              checked={remember}
              onChange={(e) => {
                setRemember(e.target.checked);
                showToast(
                  e.target.checked
                    ? '✅ سيتم تذكرك على هذا الجهاز'
                    : '🔒 لن يتم تذكرك على هذا الجهاز',
                  '',
                  2500
                );
              }}
            />
            <div className="switch-track" />
          </label>
        </div>
      </div>

      {/* ── Submit button ─────────────────── */}
      <button
        ref={btnRef}
        type="submit"
        className={`btn-login ${btnState === 'success' ? 'success-state' : ''}`}
        disabled={btnState === 'loading'}
        onMouseDown={handleRipple}
        aria-busy={btnState === 'loading'}
      >
        {btnState === 'idle' && (
          <>
            <span className="material-symbols-outlined arrow-icon">arrow_back</span>
            <span>تسجيل الدخول</span>
          </>
        )}
        {btnState === 'loading' && (
          <>
            <div className="spinner" />
            <span>جارٍ التحقق...</span>
          </>
        )}
        {btnState === 'success' && (
          <>
            <span className="material-symbols-outlined success-icon">check_circle</span>
            <span>تم الدخول!</span>
          </>
        )}
      </button>

      {/* ── Footer ────────────────────────── */}
      <div className="footer-divider">
        <p>
          ليس لديك حساب؟{' '}
          <button
            type="button"
            className="text-link"
            onClick={() => onSignUpClick?.()}
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>

      {/* ── Security badges ───────────────── */}
      <div className="security-badges">
        <div
          className="badge"
          role="button"
          tabIndex={0}
          onClick={() => showToast('جميع البيانات مشفرة بمعيار AES-256', '')}
        >
          <span className="material-symbols-outlined">shield_lock</span>
          <span>تشفير SSL متقدم</span>
        </div>
        <div
          className="badge"
          role="button"
          tabIndex={0}
          onClick={() => showToast('النظام متوافق مع معايير HIPAA الدولية', '')}
        >
          <span className="material-symbols-outlined">verified_user</span>
          <span>متوافق مع HIPAA</span>
        </div>
      </div>
    </form>
  );
}