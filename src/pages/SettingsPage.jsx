// src/pages/SettingsPage.jsx
import React, { useEffect, useState } from 'react';
import './SettingsPage.css';

const SETTINGS_PREFIX = 'doseme-settings:';
const USERS_KEY = 'doseme-users';

const DEFAULT_SETTINGS = {
  notifications: { meds: true, appointments: true, weekly: false },
  privacy: { shareWithDoctor: true },
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadSettings(key) {
  const stored = readJSON(key, null);
  if (!stored || typeof stored !== 'object') return { ...DEFAULT_SETTINGS };
  return {
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(stored.notifications || {}) },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...(stored.privacy || {}) },
  };
}

function findUserKey(users, email) {
  const target = (email || '').trim().toLowerCase();
  return Object.keys(users).find((k) => k.trim().toLowerCase() === target) || null;
}

function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`settings-switch ${checked ? 'is-on' : ''}`}
      onClick={onChange}
    >
      <span className="settings-switch__thumb" />
    </button>
  );
}

function SwitchRow({ icon, title, desc, checked, onChange }) {
  return (
    <div className="settings-row">
      <div className="settings-row__icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="settings-row__text">
        <span className="settings-row__title">{title}</span>
        {desc && <span className="settings-row__desc">{desc}</span>}
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function SettingsSection({ icon, color = 'blue', title, children }) {
  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <div className={`settings-section__icon settings-section__icon--${color}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 className="settings-section__title">{title}</h3>
      </div>
      <div className="settings-section__body">{children}</div>
    </section>
  );
}

export default function SettingsPage({ user = {}, isDark, onThemeToggle, onBack, onLogout }) {
  const email = user?.email || '';
  const storageKey = `${SETTINGS_PREFIX}${email || 'guest'}`;

  const [settings, setSettings] = useState(() => loadSettings(storageKey));
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setSettings(loadSettings(storageKey));
  }, [storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch {}
  }, [settings, storageKey]);

  const displayName = user?.fullName || user?.name || 'المستخدم';
  const displayEmail = email || '—';
  const initials = displayName.charAt(0).toUpperCase();

  const toggleNotification = (key) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));
    setStatus(null);
  };

  const togglePrivacy = (key) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: !prev.privacy[key] },
    }));
    setStatus(null);
  };

  const setPasswordField = (key) => (e) => {
    setPasswordForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (status) setStatus(null);
  };

  const changePassword = (e) => {
    e.preventDefault();
    const { current, next, confirm } = passwordForm;

    if (!current || !next || !confirm) {
      setStatus({ type: 'error', msg: 'يرجى ملء جميع الحقول.' });
      return;
    }
    if (next.length < 6) {
      setStatus({ type: 'error', msg: 'كلمة المرور الجديدة يجب أن تكون ٦ أحرف على الأقل.' });
      return;
    }
    if (next !== confirm) {
      setStatus({ type: 'error', msg: 'تأكيد كلمة المرور غير مطابق.' });
      return;
    }

    const users = readJSON(USERS_KEY, null);
    if (!users || typeof users !== 'object') {
      setStatus({ type: 'error', msg: 'تعذّر الوصول إلى بيانات الحساب.' });
      return;
    }

    const key = findUserKey(users, email);
    if (!key) {
      setStatus({ type: 'error', msg: 'الحساب غير موجود.' });
      return;
    }

    const record = users[key];
    const storedPassword = record.pass ?? record.password;
    if (storedPassword !== current) {
      setStatus({ type: 'error', msg: 'كلمة المرور الحالية غير صحيحة.' });
      return;
    }

    record.pass = next;
    if (record.password != null) record.password = next;
    users[key] = record;

    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      setPasswordForm({ current: '', next: '', confirm: '' });
      setStatus({ type: 'success', msg: 'تم تحديث كلمة المرور بنجاح.' });
    } catch {
      setStatus({ type: 'error', msg: 'تعذّر حفظ كلمة المرور، حاول مرة أخرى.' });
    }
  };

  const exportData = () => {
    const recoveryKey = `doseme-recovery:${email || 'guest'}`;
    const treatmentKey = `doseme-treatment:${email || 'guest'}`;
    const vitalsKey = `doseme-vitals:${email || 'guest'}`;

    const users = readJSON(USERS_KEY, {}) || {};
    const userKey = findUserKey(users, email);

    const payload = {
      exportedAt: new Date().toISOString(),
      account: userKey ? users[userKey] : null,
      vitals: readJSON(vitalsKey, []),
      recovery: readJSON(recoveryKey, null),
      treatment: readJSON(treatmentKey, null),
      settings,
    };

    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `doseme-data-${(email || 'user').replace(/[^a-z0-9]/gi, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', msg: 'تم تصدير نسخة من بياناتك.' });
    } catch {
      setStatus({ type: 'error', msg: 'تعذّر تصدير البيانات.' });
    }
  };

  const isDarkMode = isDark ?? false;

  return (
    <div className="settings-page" dir="rtl">
      <div className="settings-topbar">
        <button className="settings-back" onClick={onBack} aria-label="رجوع">
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
        <span className="settings-topbar__title">الإعدادات</span>
        <button
          className="settings-icon-btn"
          onClick={onThemeToggle}
          aria-label="تبديل الثيم"
          title={isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>

      <div className="settings-scroll">
        {/* Account card */}
        <div className="settings-account">
          <div className="settings-account__avatar">{initials}</div>
          <div className="settings-account__info">
            <strong>{displayName}</strong>
            <span dir="ltr">{displayEmail}</span>
          </div>
        </div>

        {status && (
          <div className={`settings-alert settings-alert--${status.type}`}>
            <span className="material-symbols-outlined">
              {status.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {status.msg}
          </div>
        )}

        {/* Appearance */}
        <SettingsSection icon="palette" color="purple" title="المظهر">
          <SwitchRow
            icon="dark_mode"
            title="الوضع الداكن"
            desc="استخدم ثيماً داكناً مريحاً للعين ليلاً."
            checked={isDarkMode}
            onChange={onThemeToggle}
          />
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection icon="notifications" color="amber" title="الإشعارات">
          <SwitchRow
            icon="medication"
            title="تذكير الأدوية"
            desc="تنبيه عند موعد كل جرعة."
            checked={settings.notifications.meds}
            onChange={() => toggleNotification('meds')}
          />
          <SwitchRow
            icon="event"
            title="تذكير المواعيد"
            desc="تنبيه قبل موعد الطبيب."
            checked={settings.notifications.appointments}
            onChange={() => toggleNotification('appointments')}
          />
          <SwitchRow
            icon="summarize"
            title="التقرير الأسبوعي"
            desc="ملخص أسبوعي لحالتك على بريدك."
            checked={settings.notifications.weekly}
            onChange={() => toggleNotification('weekly')}
          />
        </SettingsSection>

        {/* Privacy & data */}
        <SettingsSection icon="shield_lock" color="green" title="الخصوصية والبيانات">
          <SwitchRow
            icon="share"
            title="مشاركة البيانات مع الطبيب"
            desc="السماح لطبيبك بالاطلاع على مؤشراتك وخطتك."
            checked={settings.privacy.shareWithDoctor}
            onChange={() => togglePrivacy('shareWithDoctor')}
          />
          <button className="settings-action" onClick={exportData}>
            <span className="material-symbols-outlined">download</span>
            <div className="settings-action__text">
              <strong>تصدير نسخة من بياناتي</strong>
              <span>تنزيل ملف JSON يحتوي بيانات حسابك وقراءاتك.</span>
            </div>
            <span className="material-symbols-outlined settings-action__chevron">chevron_left</span>
          </button>
        </SettingsSection>

        {/* Security */}
        <SettingsSection icon="lock" color="blue" title="الأمان">
          <form className="settings-password" onSubmit={changePassword}>
            <label className="settings-field">
              <span>كلمة المرور الحالية</span>
              <input
                type="password"
                autoComplete="current-password"
                value={passwordForm.current}
                onChange={setPasswordField('current')}
              />
            </label>
            <label className="settings-field">
              <span>كلمة المرور الجديدة</span>
              <input
                type="password"
                autoComplete="new-password"
                value={passwordForm.next}
                onChange={setPasswordField('next')}
              />
            </label>
            <label className="settings-field">
              <span>تأكيد كلمة المرور</span>
              <input
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirm}
                onChange={setPasswordField('confirm')}
              />
            </label>
            <button type="submit" className="settings-save">
              <span className="material-symbols-outlined">key</span>
              تحديث كلمة المرور
            </button>
          </form>
        </SettingsSection>

        {/* Logout */}
        <button className="settings-logout" onClick={onLogout}>
          <span className="material-symbols-outlined">logout</span>
          تسجيل الخروج
        </button>

        <p className="settings-version">DoseMe • الإصدار 1.0.0</p>
      </div>
    </div>
  );
}
