import React, { useState } from 'react';
import './DashboardPage.css';

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const VITALS = [
  {
    id: 'bp',
    label: 'ضغط الدم',
    value: '١٢٠/٨٠',
    unit: 'مليمتر زئبقي',
    time: 'تم القياس قبل ٣٠ دقيقة',
    badge: 'آخر قراءة',
    badgeType: 'info',
    status: 'stable',
  },
  {
    id: 'sugar',
    label: 'سكر الدم',
    value: '١٤٥',
    unit: 'mg/dL',
    badge: 'مرتفع قليلاً',
    badgeType: 'warning',
    status: 'warning',
  },
  {
    id: 'heart',
    label: 'نبض القلب',
    value: '٧٢',
    unit: 'bpm',
    badge: 'مستقر',
    badgeType: 'success',
    status: 'success',
  },
];

const TASKS = [
  {
    id: 1,
    time: '٠٨:٠٠ ص',
    name: 'مدر البول (Furosemide)',
    desc: '٤٠ ملغ • مع الإفطار',
    icon: 'medication',
    actionLabel: 'تم التناول',
    actionType: 'pending',
    color: '#0066ff',
  },
  {
    id: 2,
    time: '٠٨:١٥ ص',
    name: 'قياس الوزن اليومي',
    desc: 'قبل الإفطار',
    icon: 'monitor_weight',
    actionLabel: 'مكتمل',
    actionType: 'done',
    color: '#059669',
  },
  {
    id: 3,
    time: '٠٢:٠٠ م',
    name: 'أسبرين (Aspirin)',
    desc: '٧٥ ملغ • بعد الغداء',
    icon: 'medication',
    actionLabel: 'تم التناول',
    actionType: 'pending',
    color: '#0066ff',
  },
  {
    id: 4,
    time: '٠٩:٠٠ م',
    name: 'قياس ضغط الدم',
    desc: 'فترة المساء',
    icon: 'health_metrics',
    actionLabel: 'قياس الآن',
    actionType: 'cta',
    color: '#dc2626',
  },
];

/* ─────────────────────────────────────────────
   BADGE HELPER
───────────────────────────────────────────── */
function Badge({ type, children }) {
  return <span className={`dm-badge dm-badge--${type}`}>{children}</span>;
}

/* ─────────────────────────────────────────────
   VITAL CARD
───────────────────────────────────────────── */
function VitalCard({ vital }) {
  return (
    <div className={`vital-card vital-card--${vital.status}`}>
      <div className="vital-card__top">
        <Badge type={vital.badgeType}>{vital.badge}</Badge>
        {vital.status === 'warning' && (
          <span className="vital-card__icon material-symbols-outlined warn">warning</span>
        )}
        {vital.status === 'success' && (
          <span className="vital-card__icon material-symbols-outlined ok">favorite</span>
        )}
      </div>
      <div className="vital-card__body">
        <div className="vital-card__label">{vital.label}</div>
        <div className="vital-card__value">{vital.value}</div>
        <div className="vital-card__unit">{vital.unit}</div>
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

/* ─────────────────────────────────────────────
   TASK ROW
───────────────────────────────────────────── */
function TaskRow({ task, onAction }) {
  return (
    <div className="task-row">
      <div className="task-row__time">{task.time}</div>
      <div className="task-row__info">
        <div className="task-row__name">{task.name}</div>
        <div className="task-row__desc">{task.desc}</div>
      </div>
      <div className="task-row__action">
        {task.actionType === 'done' ? (
          <span className="task-done">
            <span className="material-symbols-outlined">check_circle</span>
            {task.actionLabel}
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
      <div
        className="task-row__dot"
        style={{ background: task.color }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUMMARY CARD (left bottom)
───────────────────────────────────────────── */
function SummaryCard() {
  return (
    <div className="summary-card">
      <div className="summary-card__text">
        <h3>ملخص حالتك الأسبوعي</h3>
        <p>
          لقد التزمت بجدول أدويتك بنسبة ٩٥٪ هذا الأسبوع. عمل رائع!
        </p>
      </div>
      <div className="summary-card__img" aria-hidden="true">
        <span className="material-symbols-outlined">monitoring</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */
export default function DashboardPage({ userEmail = 'doctor@clinic.com', onLogout }) {
  const [tasks, setTasks] = useState(TASKS);

  const getDisplayName = (email) => {
    const raw = (email || '').trim();
    if (!raw) return 'المستخدم';
    const first = raw.split('@')[0] || raw;
    return first.charAt(0).toUpperCase() + first.slice(1);
  };

  const displayName = getDisplayName(userEmail);


  const handleAction = (task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, actionType: 'done', actionLabel: 'مكتمل' } : t
      )
    );
  };

  return (
    <div className="dashboard" dir="rtl">
      {/* ── Navbar ────────────────────────────── */}
      <nav className="dash-nav">
        <div className="dash-nav__logo">
          <span className="material-symbols-outlined">health_and_safety</span>
          <span>DoseMe</span>
        </div>
        <div className="dash-nav__actions">
          <button className="dash-nav__btn" aria-label="الإعدادات">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="dash-nav__btn" aria-label="الإشعارات">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="dash-nav__avatar" onClick={onLogout} title="تسجيل الخروج">
            <span className="material-symbols-outlined">account_circle</span>
          </div>
        </div>
      </nav>

      {/* ── Main content ──────────────────────── */}
      <main className="dash-main">
        {/* Greeting */}
        <div className="dash-greeting">
          <div className="dash-greeting__text">
            <h1>صباح الخير، {displayName}</h1>
            <p>اليوم هو الثلاثاء ١٥ أكتوبر، لديك ٤ مهام صحية متبقية.</p>

          </div>
          <button className="btn-new-reading">
            <span className="material-symbols-outlined">add_circle</span>
            تسجيل قراءة جديدة
          </button>
        </div>

        {/* Grid: vitals + tasks */}
        <div className="dash-grid">
          {/* ── Vitals row ──────────────────── */}
          <section className="dash-vitals" aria-label="المؤشرات الحيوية">
            {VITALS.map((v) => (
              <VitalCard key={v.id} vital={v} />
            ))}
          </section>

          {/* ── Bottom row ──────────────────── */}
          <div className="dash-bottom">
            {/* Summary card */}
            <SummaryCard />

            {/* Tasks list */}
            <section className="dash-tasks" aria-label="قائمة المهام اليومية">
              <div className="dash-tasks__header">
                <h2>قائمة المهام اليومية</h2>
                <button className="link-btn">عرض الجدول كاملاً</button>
              </div>
              <div className="dash-tasks__list">
                {tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onAction={handleAction} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
