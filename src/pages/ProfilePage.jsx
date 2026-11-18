import React, { useState, useEffect } from 'react';
import './ProfilePage.css';

const CHRONIC_LABELS = {
  diabetes: { label: 'السكري (النوع 2)',   icon: 'glucose',     color: 'red' },
  bp:       { label: 'ارتفاع ضغط الدم',   icon: 'vital_signs', color: 'orange' },
  heart:    { label: 'أمراض القلب',        icon: 'cardiology',  color: 'red' },
  asthma:   { label: 'الربو',              icon: 'pulmonology', color: 'blue' },
  allergy:  { label: 'حساسية البنسلين',   icon: 'medication',  color: 'amber' },
  kidney:   { label: 'الفشل الكلوي',       icon: 'nephrology',  color: 'purple' },
};

const MEDS = [
  { name: 'ميتفورمين', dose: '٥٠٠ مجم', freq: 'مرتين يومياً', icon: 'medication', color: 'blue' },
  { name: 'أملوديبين', dose: '٥ مجم',   freq: 'مرة يومياً',   icon: 'pill',       color: 'teal' },
  { name: 'أسبرين',    dose: '٧٥ مجم',  freq: 'مرة يومياً',   icon: 'medication', color: 'green' },
];

function InfoRow({ icon, label, value, color = 'blue' }) {
  return (
    <div className="info-row">
      <div className={`info-row__icon info-row__icon--${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="info-row__text">
        <span className="info-row__label">{label}</span>
        <span className="info-row__value">{value || '—'}</span>
      </div>
    </div>
  );
}

function Section({ icon, title, color = 'blue', children, collapsible = false }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="profile-section">
      <div
        className="profile-section__header"
        onClick={() => collapsible && setOpen(o => !o)}
        style={{ cursor: collapsible ? 'pointer' : 'default' }}
      >
        <div className={`profile-section__icon profile-section__icon--${color}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="profile-section__title">{title}</span>
        {collapsible && (
          <span className={`profile-section__chevron material-symbols-outlined ${open ? 'open' : ''}`}>
            expand_more
          </span>
        )}
      </div>
      {(!collapsible || open) && <div className="profile-section__body">{children}</div>}
    </div>
  );
}

export default function ProfilePage({ user = {}, onBack, onLogout, isDark, onThemeToggle, onOpenSettings }) {
  const fullName  = user.fullName  || 'المستخدم';
  const email     = user.email     || '';
  const phone     = user.phone     || '';
  const age       = user.age       || '';
  const gender    = user.gender    || '';
  const height    = user.height    || '';
  const weight    = user.weight    || '';
  const bloodType = user.bloodType || '';
  const chronic   = user.chronic   || [];

  const bmi = height && weight
    ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1) : '—';
  const bmiStatus = bmi !== '—'
    ? Number(bmi) < 18.5 ? 'نحيف' : Number(bmi) < 25 ? 'طبيعي' : Number(bmi) < 30 ? 'زيادة وزن' : 'سمنة'
    : '';

  const userId = 'DM-' + Math.floor(100000 + Math.random() * 800000);

  return (
    <div className="profile-page" dir="rtl">
      {/* ── Top bar ────────────────────── */}
      <div className="profile-topbar">
        <button className="profile-back" onClick={onBack} aria-label="رجوع">
          <span className="material-symbols-outlined">arrow_forward_ios</span>
        </button>
        <span className="profile-topbar__title">الملف الشخصي</span>
        <div className="profile-topbar__actions">
          <button className="profile-icon-btn" onClick={onThemeToggle} aria-label="تبديل الثيم">
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button className="profile-icon-btn" aria-label="الإشعارات">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="profile-icon-btn" aria-label="الإعدادات" onClick={onOpenSettings}>
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>

      <div className="profile-scroll">
        {/* ── Hero card ──────────────────── */}
        <div className="profile-hero">
          <div className="profile-avatar">
            <span className="profile-avatar__letter">{fullName.charAt(0)}</span>
            <button className="profile-avatar__edit" aria-label="تعديل الصورة">
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
          <h2 className="profile-name">{fullName}</h2>
          <p className="profile-uid">المعرف الرقمي: #{userId}</p>

          {/* Quick stats */}
          <div className="profile-quick-stats">
            <div className="pqs-item">
              <span className="material-symbols-outlined">calendar_today</span>
              <div className="pqs-val">{age || '—'}</div>
              <div className="pqs-lbl">العمر</div>
            </div>
            <div className="pqs-divider" />
            <div className="pqs-item">
              <span className="material-symbols-outlined">water_drop</span>
              <div className="pqs-val pqs-val--red">{bloodType || '—'}</div>
              <div className="pqs-lbl">الفصيلة</div>
            </div>
            <div className="pqs-divider" />
            <div className="pqs-item">
              <span className="material-symbols-outlined">monitor_weight</span>
              <div className="pqs-val">{weight ? `${weight} كجم` : '—'}</div>
              <div className="pqs-lbl">الوزن</div>
            </div>
          </div>
        </div>

        {/* ── BMI card ───────────────────── */}
        {bmi !== '—' && (
          <div className="bmi-card">
            <div className="bmi-card__left">
              <div className="bmi-card__val">{bmi}</div>
              <div className="bmi-card__label">مؤشر كتلة الجسم (BMI)</div>
              <div className={`bmi-card__status ${Number(bmi) < 25 ? 'ok' : 'warn'}`}>{bmiStatus}</div>
            </div>
            <div className="bmi-card__bar">
              <div className="bmi-track">
                <div className="bmi-fill" style={{ width: `${Math.min((Number(bmi) / 40) * 100, 100)}%` }} />
                <div className="bmi-pointer" style={{ left: `${Math.min((Number(bmi) / 40) * 100, 100)}%` }} />
              </div>
              <div className="bmi-labels">
                <span>نحيف</span><span>طبيعي</span><span>زيادة</span><span>سمنة</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Personal info ──────────────── */}
        <Section icon="person" title="المعلومات الشخصية" color="blue" collapsible>
          <InfoRow icon="badge"           label="الاسم الكامل"       value={fullName}            color="blue" />
          <InfoRow icon="mail"            label="البريد الإلكتروني"  value={email}               color="teal" />
          <InfoRow icon="smartphone"      label="رقم الهاتف"         value={phone}               color="green" />
          <InfoRow icon="wc"              label="الجنس"              value={gender}              color="purple" />
          <InfoRow icon="straighten"      label="الطول"              value={height ? `${height} سم` : ''} color="blue" />
        </Section>

        {/* ── Medical info ───────────────── */}
        <Section icon="health_and_safety" title="المعلومات الطبية" color="red" collapsible>
          <InfoRow icon="water_drop"      label="فصيلة الدم"         value={bloodType}           color="red" />
          <InfoRow icon="monitor_weight"  label="الوزن"              value={weight ? `${weight} كجم` : ''} color="blue" />
          <InfoRow icon="height"          label="الطول"              value={height ? `${height} سم` : ''} color="teal" />
          {chronic.length > 0 && (
            <div className="chronic-tags">
              {chronic.map(id => {
                const c = CHRONIC_LABELS[id];
                if (!c) return null;
                return (
                  <span key={id} className={`chronic-tag chronic-tag--${c.color}`}>
                    <span className="material-symbols-outlined">{c.icon}</span>
                    {c.label}
                  </span>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Active medications ─────────── */}
        <Section icon="medication" title="الأدوية التنشطة" color="teal" collapsible>
          {MEDS.map(med => (
            <div key={med.name} className={`med-row med-row--${med.color}`}>
              <div className="med-row__icon">
                <span className="material-symbols-outlined">{med.icon}</span>
              </div>
              <div className="med-row__info">
                <span className="med-row__name">{med.name}</span>
                <span className="med-row__detail">{med.dose} • {med.freq}</span>
              </div>
              <span className="med-row__arrow material-symbols-outlined">chevron_left</span>
            </div>
          ))}
        </Section>

        {/* ── Logout ─────────────────────── */}
        <button className="profile-logout" onClick={onLogout}>
          <span className="material-symbols-outlined">logout</span>
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
