// src/components/OverviewTab.jsx
import React, { useState } from 'react';

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
  { id: 1, time: '٠٨:٠٠ ص', name: 'مدر البول (Furosemide)', desc: '٤٠ ملغ • مع الإفطار', icon: 'medication', actionLabel: 'تم التناول', actionType: 'pending', color: 'blue' },
  { id: 2, time: '٠٨:١٥ ص', name: 'قياس الوزن اليومي', desc: 'قبل الإفطار', icon: 'monitor_weight', actionLabel: 'مكتمل', actionType: 'done', color: 'green' },
  { id: 3, time: '٠٢:٠٠ م', name: 'أسبرين (Aspirin)', desc: '٧٥ ملغ • بعد الغداء', icon: 'medication', actionLabel: 'تم التناول', actionType: 'pending', color: 'blue' },
  { id: 4, time: '٠٩:٠٠ م', name: 'قياس ضغط الدم', desc: 'فترة المساء', icon: 'health_metrics', actionLabel: 'قياس الآن', actionType: 'cta', color: 'red' },
];

const WEEK_DATA = [
  { day: 'السبت', val: 78 },
  { day: 'الأحد', val: 82 },
  { day: 'الاثنين', val: 75 },
  { day: 'الثلاثاء', val: 88 },
  { day: 'الأربعاء', val: 72 },
  { day: 'الخميس', val: 80 },
  { day: 'الجمعة', val: 77 },
];

function Badge({ type, children }) {
  return <span className={`dm-badge dm-badge--${type}`}>{children}</span>;
}

function WeekBar({ data }) {
  const max = Math.max(...data.map(d => d.val));
  return (
    <div className="week-bar">
      {data.map((d, i) => (
        <div key={i} className="week-bar__col">
          <div className="week-bar__track">
            <div className="week-bar__fill" style={{ height: `${(d.val / max) * 100}%` }} />
          </div>
          <span className="week-bar__label">{d.day.slice(0, 3)}</span>
        </div>
      ))}
    </div>
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
        <div className="vital-card__time">
          <span className="material-symbols-outlined">schedule</span>
          {vital.time}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task, onAction }) {
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
          <button className={`task-btn task-btn--${task.actionType}`} onClick={() => onAction(task)}>
            {task.actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function OverviewTab({ userEmail, userData }) {
  const [tasks, setTasks] = useState(TASKS);
  
  const getDisplayName = () => {
    if (userData?.fullName) return userData.fullName;
    const raw = (userEmail || '').trim();
    if (!raw) return 'المستخدم';
    const part = raw.split('@')[0] || raw;
    return part.charAt(0).toUpperCase() + part.slice(1);
  };

  const displayName = getDisplayName();
  const doneTasks = tasks.filter(t => t.actionType === 'done').length;
  const progress = Math.round((doneTasks / tasks.length) * 100);
  
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور';

  const handleAction = (task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, actionType: 'done', actionLabel: 'مكتمل' } : t));
  };

  return (
    <div className="overview-tab">
      {/* Greeting */}
      <div className="dash-greeting">
        <div>
          <h1 className="dash-greeting__title">{greeting}، {displayName} 👋</h1>
          <p className="dash-greeting__sub">لديك <strong>{tasks.length - doneTasks}</strong> مهام متبقية اليوم</p>
        </div>
        <button className="btn-primary">
          <span className="material-symbols-outlined">add_circle</span>
          تسجيل قراءة جديدة
        </button>
      </div>

      {/* Stats Bar */}
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

      {/* Grid Layout */}
      <div className="dash-grid">
        {/* Left Column */}
        <div className="dash-col dash-col--main">
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

        {/* Right Column */}
        <div className="dash-col dash-col--side">
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

          <div className="section-card section-card--tasks">
            <div className="section-card__header">
              <div className="section-card__title">
                <span className="material-symbols-outlined">checklist</span>
                مهام اليوم
              </div>
              <button className="link-btn">عرض الكل</button>
            </div>
            <div className="tasks-list">
              {tasks.map(task => <TaskRow key={task.id} task={task} onAction={handleAction} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}