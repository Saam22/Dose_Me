import React, { useState, useEffect } from 'react';
import './DashboardPage.css';

const VITALS = [
  {
    id: 'bp', label: 'ضغط الدم', value: '١٢٠/٨٠', unit: 'مليمتر زئبقي',
    time: 'قبل ٣٠ دقيقة', badge: 'آخر قراءة', badgeType: 'info',
    status: 'stable', icon: 'vital_signs', trend: '+2%',
  },
  {
    id: 'sugar', label: 'سكر الدم', value: '١٤٥', unit: 'mg/dL',
    badge: 'مرتفع قليلاً', badgeType: 'warning', status: 'warning',
    icon: 'glucose', trend: '+8%',
  },
  {
    id: 'heart', label: 'نبض القلب', value: '٧٢', unit: 'bpm',
    badge: 'مستقر', badgeType: 'success', status: 'success',
    icon: 'cardiology', trend: '-1%',
  },
];

const TASKS = [
  { id: 1, time: '٠٨:٠٠ ص', name: 'مدر البول (Furosemide)', desc: '٤٠ ملغ • مع الإفطار',   icon: 'medication',     actionLabel: 'تم التناول', actionType: 'pending', color: 'blue' },
  { id: 2, time: '٠٨:١٥ ص', name: 'قياس الوزن اليومي',      desc: 'قبل الإفطار',          icon: 'monitor_weight', actionLabel: 'مكتمل',     actionType: 'done',    color: 'green' },
  { id: 3, time: '٠٢:٠٠ م', name: 'أسبرين (Aspirin)',        desc: '٧٥ ملغ • بعد الغداء',  icon: 'medication',     actionLabel: 'تم التناول', actionType: 'pending', color: 'blue' },
  { id: 4, time: '٠٩:٠٠ م', name: 'قياس ضغط الدم',          desc: 'فترة المساء',           icon: 'health_metrics', actionLabel: 'قياس الآن',  actionType: 'cta',     color: 'red' },
];

const WEEK_DATA = [
  { day: 'السبت',   val: 78 },
  { day: 'الأحد',   val: 82 },
  { day: 'الاثنين', val: 75 },
  { day: 'الثلاثاء',val: 88 },
  { day: 'الأربعاء',val: 72 },
  { day: 'الخميس',  val: 80 },
  { day: 'الجمعة',  val: 77 },
];

function Badge({ type, children }) {
  return <span className={`dm-badge dm-badge--${type}`}>{children}</span>;
}

function MiniChart({ data }) {
  const max = Math.max(...data.map(d => d.val));
  const min = Math.min(...data.map(d => d.val));
  const H = 48, W = 140;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((d.val - min) / (max - min + 1)) * (H - 8);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="mini-chart">
      <polyline points={pts} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mini-chart__line" />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * W;
        const y = H - ((d.val - min) / (max - min + 1)) * (H - 8);
        return <circle key={i} cx={x} cy={y} r="3" className="mini-chart__dot" />;
      })}
    </svg>
  );
}

function VitalCard({ vital }) {
  return (
    <div className={`vital-card vital-card--${vital.status}`}>
      <div className="vital-card__header">
        <div className={`vital-card__icon-wrap vital-card__icon-wrap--${vital.status}`}>
          <span className="material-symbols-outlined">{vital.icon}</span>
        </div>
        <Badge type={vital.badgeType}>{vital.badge}</Badge>
      </div>
      <div className="vital-card__body">
        <p className="vital-card__label">{vital.label}</p>
        <div className="vital-card__value-row">
          <span className="vital-card__value">{vital.value}</span>
          <span className="vital-card__unit">{vital.unit}</span>
        </div>
        {vital.trend && (
          <div className={`vital-card__trend vital-card__trend--${vital.status}`}>
            <span className="material-symbols-outlined">
              {vital.trend.startsWith('+') ? 'trending_up' : 'trending_down'}
            </span>
            <span>{vital.trend} هذا الأسبوع</span>
          </div>
        )}
        {vital.time && (
          <div className="vital-card__time">
            <span className="material-symbols-outlined">schedule</span>
            {vital.time}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, onAction }) {
  const colorMap = { blue: '#3b82f6', green: '#10b981', red: '#ef4444' };
  return (
    <div className="task-row">
      <div className="task-row__left">
        <div className="task-row__time">{task.time}</div>
        <div className={`task-row__icon-wrap task-row__icon-wrap--${task.color}`}>
          <span className="material-symbols-outlined">{task.icon}</span>
        </div>
      </div>
      <div className="task-row__info">
        <div className="task-row__name">{task.name}</div>
        <div className="task-row__desc">{task.desc}</div>
      </div>
      <div className="task-row__action">
        {task.actionType === 'done' ? (
          <span className="task-done">
            <span className="material-symbols-outlined">check_circle</span>
            مكتمل
          </span>
        ) : (
          <button
            className={`task-btn task-btn--${task.actionType}`}
            onClick={() => onAction(task)}
          >
            {task.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

function WeekBar({ data }) {
  const max = Math.max(...data.map(d => d.val));
  return (
    <div className="week-bar">
      {data.map((d, i) => (
        <div key={i} className="week-bar__col">
          <div className="week-bar__track">
            <div
              className="week-bar__fill"
              style={{ height: `${(d.val / max) * 100}%` }}
            />
          </div>
          <span className="week-bar__label">{d.day.slice(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage({ userEmail = '', onLogout }) {
  const [tasks, setTasks] = useState(TASKS);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('doseme-theme') === 'dark'; }
    catch { return false; }
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('doseme-theme', isDark ? 'dark' : 'light'); }
    catch {}
  }, [isDark]);

  const getDisplayName = (email) => {
    const raw = (email || '').trim();
    if (!raw) return 'المستخدم';
    const part = raw.split('@')[0] || raw;
    return part.charAt(0).toUpperCase() + part.slice(1);
  };

  const displayName = getDisplayName(userEmail);
  const doneTasks = tasks.filter(t => t.actionType === 'done').length;
  const progress = Math.round((doneTasks / tasks.length) * 100);

  const handleAction = (task) => {
    setTasks(prev =>
      prev.map(t => t.id === task.id ? { ...t, actionType: 'done', actionLabel: 'مكتمل' } : t)
    );
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور';

  const TABS = [
    { id: 'overview', label: 'نظرة عامة',  icon: 'dashboard' },
    { id: 'vitals',   label: 'المؤشرات',   icon: 'vital_signs' },
    { id: 'schedule', label: 'الجدول',      icon: 'calendar_month' },
  ];

  return (
    <div className="dashboard" dir="rtl">

      {/* ══ NAVBAR ══════════════════════════════ */}
      <nav className="dash-nav">
        <div className="dash-nav__logo">
          <div className="dash-nav__logo-icon">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <span className="dash-nav__logo-text">DoseMe</span>
        </div>

        <div className="dash-nav__tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`dash-nav__tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="dash-nav__actions">
          <button
            className="dash-nav__theme-btn"
            onClick={() => setIsDark(d => !d)}
            aria-label="تبديل الثيم"
            title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            <span className="material-symbols-outlined">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button className="dash-nav__icon-btn" aria-label="الإشعارات">
            <span className="material-symbols-outlined">notifications</span>
            <span className="dash-nav__notif-dot" />
          </button>
          <button className="dash-nav__avatar" onClick={onLogout} title="تسجيل الخروج">
            <span className="dash-nav__avatar-initials">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </button>
        </div>
      </nav>

      {/* ══ MAIN ════════════════════════════════ */}
      <main className="dash-main">

        {/* ── Greeting bar ─────────────────── */}
        <div className="dash-greeting">
          <div>
            <h1 className="dash-greeting__title">{greeting}، {displayName} 👋</h1>
            <p className="dash-greeting__sub">
              لديك <strong>{tasks.length - doneTasks}</strong> مهام متبقية اليوم
            </p>
          </div>
          <button className="btn-primary">
            <span className="material-symbols-outlined">add_circle</span>
            تسجيل قراءة جديدة
          </button>
        </div>

        {/* ── Stats bar ────────────────────── */}
        <div className="stats-bar">
          <div className="stat-pill stat-pill--blue">
            <span className="material-symbols-outlined">medication</span>
            <div>
              <div className="stat-pill__val">{doneTasks}/{tasks.length}</div>
              <div className="stat-pill__lbl">مهام مكتملة</div>
            </div>
          </div>
          <div className="stat-pill stat-pill--teal">
            <span className="material-symbols-outlined">trending_up</span>
            <div>
              <div className="stat-pill__val">٩٥٪</div>
              <div className="stat-pill__lbl">الالتزام الأسبوعي</div>
            </div>
          </div>
          <div className="stat-pill stat-pill--amber">
            <span className="material-symbols-outlined">local_hospital</span>
            <div>
              <div className="stat-pill__val">٣</div>
              <div className="stat-pill__lbl">أدوية نشطة</div>
            </div>
          </div>
          <div className="stat-pill stat-pill--green">
            <span className="material-symbols-outlined">calendar_month</span>
            <div>
              <div className="stat-pill__val">١٤ يوم</div>
              <div className="stat-pill__lbl">بدون انقطاع</div>
            </div>
          </div>
        </div>

        {/* ── Grid ─────────────────────────── */}
        <div className="dash-grid">

          {/* LEFT COL */}
          <div className="dash-col dash-col--main">

            {/* Vitals */}
            <div className="section-card">
              <div className="section-card__header">
                <div className="section-card__title">
                  <span className="material-symbols-outlined">vital_signs</span>
                  المؤشرات الحيوية
                </div>
                <span className="section-card__badge">محدّث الآن</span>
              </div>
              <div className="vitals-grid">
                {VITALS.map(v => <VitalCard key={v.id} vital={v} />)}
              </div>
            </div>

            {/* Weekly chart */}
            <div className="section-card">
              <div className="section-card__header">
                <div className="section-card__title">
                  <span className="material-symbols-outlined">bar_chart</span>
                  نبض القلب — هذا الأسبوع
                </div>
                <span className="chart-unit">bpm</span>
              </div>
              <WeekBar data={WEEK_DATA} />
            </div>
          </div>

          {/* RIGHT COL */}
          <div className="dash-col dash-col--side">

            {/* Progress card */}
            <div className="progress-card">
              <div className="progress-card__top">
                <div>
                  <h3 className="progress-card__title">التزامك الأسبوعي</h3>
                  <p className="progress-card__sub">استمر، أنت رائع!</p>
                </div>
                <div className="progress-card__pct">{progress}٪</div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-card__stats">
                <span><strong>{doneTasks}</strong> مكتمل</span>
                <span><strong>{tasks.length - doneTasks}</strong> متبقي</span>
              </div>
            </div>

            {/* Tasks */}
            <div className="section-card section-card--tasks">
              <div className="section-card__header">
                <div className="section-card__title">
                  <span className="material-symbols-outlined">checklist</span>
                  مهام اليوم
                </div>
                <button className="link-btn">عرض الكل</button>
              </div>
              <div className="tasks-list">
                {tasks.map(task => (
                  <TaskRow key={task.id} task={task} onAction={handleAction} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
