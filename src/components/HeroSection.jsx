import React from 'react';
import './HeroSection.css';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAqMjcIdZN0dcGAqt1Eyxe9DxXDIgCoob44C6qhRHhp-i4_KF8YNdF5kt9b96VnB3GBPbJOhpsgW-IH3uN8wuKw8KJbV38smrep0jKE3lh5ksgALZ4DqTMVFXBeInqppval9Jhm8iDBPFO8eIFxTOc_JI32xFRXYOTEwRBTMA7r6nmoQlp_lcgd6Q_Ze942db7ZYJnlcbNUAm1R1RZb9v3pgUwWdNirK2h7E_H-txSlXvQURGJWEWm0UlYPQFB9C8kxH6kfq5NTKiNa';

const STATS = [
  { num: '+١٢ك', lbl: 'طبيب نشط' },
  { num: '٩٨٪',  lbl: 'رضا المرضى' },
  { num: '٢٤/٧', lbl: 'دعم مستمر' },
];

const CARDS = [
  { icon: 'monitoring', title: 'متابعة لحظية',  sub: 'للمؤشرات الحيوية' },
  { icon: 'analytics',  title: 'تقارير ذكية',   sub: 'بتحليل الذكاء الاصطناعي' },
  { icon: 'medication', title: 'جرعات دقيقة',   sub: 'بروتوكولات موثوقة' },
];

/**
 * HeroSection
 * Full-height decorative right panel (visible only on ≥1024 px screens).
 */
export default function HeroSection() {
  return (
    <section className="hero-section" aria-label="معلومات عن DoseMe">
      {/* Background image */}
      <div className="hero-bg-img">
        <img src={HERO_IMAGE} alt="منشأة طبية" loading="lazy" />
      </div>
      <div className="hero-gradient" aria-hidden="true" />

      {/* Content */}
      <div className="hero-content">
        <div className="hero-tag">نظام الإدارة الطبية المتكامل</div>

        <h2 className="hero-title">
          رؤية أعمق،<br />
          <span className="accent">رعاية أفضل</span> لمرضاك.
        </h2>

        <p className="hero-desc">
          انضم إلى آلاف الأطباء الذين يستخدمون منصة "DoseMe" لمتابعة مؤشرات
          المرضى الحيوية، إدارة الخطط العلاجية، وتحسين جودة الحياة الصحية.
        </p>

        {/* Stats */}
        <div className="hero-stats">
          {STATS.map(({ num, lbl }) => (
            <div className="stat-chip" key={lbl}>
              <div className="stat-num">{num}</div>
              <div className="stat-lbl">{lbl}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="hero-cards">
          {CARDS.map(({ icon, title, sub }) => (
            <div className="hero-card" key={title}>
              <span className="material-symbols-outlined">{icon}</span>
              <div className="hero-card-title">{title}</div>
              <div className="hero-card-sub">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
