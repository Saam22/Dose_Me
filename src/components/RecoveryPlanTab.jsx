// src/components/RecoveryPlanTab.jsx
import React, { useEffect, useMemo, useState } from 'react';
import './RecoveryPlanTab.css';

const STORAGE_PREFIX = 'doseme-recovery:';
const DEFAULT_DAYS = 18;
const PLAN_DAYS = 84;

const PHASES = [
  {
    id: 1,
    title: 'التقييم والتشخيص',
    desc: 'مراجعة التاريخ المرضي والفحوصات وتحديد أهداف التعافي.',
    icon: 'stethoscope',
    start: 'الأسبوع ١',
    minProgress: 0,
  },
  {
    id: 2,
    title: 'الالتزام بالعلاج',
    desc: 'المواظبة على الأدوية والقياسات اليومية حسب توصيات الطبيب.',
    icon: 'medication',
    start: 'الأسابيع ٢–٤',
    minProgress: 25,
  },
  {
    id: 3,
    title: 'استعادة النشاط',
    desc: 'العودة التدريجية للحركة والنشاط اليومي وبناء عادات صحية.',
    icon: 'directions_run',
    start: 'الأسابيع ٥–٨',
    minProgress: 60,
  },
  {
    id: 4,
    title: 'الوقاية والمتابعة',
    desc: 'تثبيت النتائج والوقاية من الانتكاسة مع متابعة دورية.',
    icon: 'shield_with_heart',
    start: 'الأسبوع ٩+',
    minProgress: 85,
  },
];

const STATUS_LABEL = { done: 'مكتملة', active: 'جارية الآن', upcoming: 'قادمة' };

const DEFAULT_TASKS = [
  { id: 1, text: 'تناول الأدوية في مواعيدها', detail: '٣ جرعات يومياً', icon: 'medication', done: true },
  { id: 2, text: 'قياس ضغط الدم صباحاً ومساءً', detail: 'مرتين يومياً', icon: 'vital_signs', done: true },
  { id: 3, text: 'المشي ٣٠ دقيقة', detail: 'بعد الغداء', icon: 'directions_walk', done: false },
  { id: 4, text: 'شرب ٨ أكواب ماء', detail: 'على مدار اليوم', icon: 'water_drop', done: false },
  { id: 5, text: 'تسجيل الأعراض اليومية', detail: 'قبل النوم', icon: 'edit_note', done: false },
];

const BASE_GOALS = [
  { id: 'meds', label: 'الالتزام بالأدوية', target: '٩٥٪', value: 0, dynamic: 'adherence', color: 'blue', icon: 'medication' },
  { id: 'activity', label: 'النشاط البدني', target: '٥ أيام أسبوعياً', value: 60, color: 'teal', icon: 'directions_run' },
  { id: 'sleep', label: 'ساعات النوم', target: '٧–٨ ساعات', value: 75, color: 'violet', icon: 'bedtime' },
  { id: 'diet', label: 'النظام الغذائي', target: '٣ وجبات متوازنة', value: 50, color: 'amber', icon: 'restaurant' },
];

const MEALS = [
  {
    id: 'breakfast',
    label: 'الإفطار',
    time: '٧:٠٠ – ٩:٠٠ ص',
    icon: 'free_breakfast',
    items: ['شوفان بالحليب', 'موزة', 'بيضة مسلوقة'],
    kcal: '≈ ٣٥٠ سعرة',
  },
  {
    id: 'snack1',
    label: 'وجبة خفيفة',
    time: '١١:٠٠ ص',
    icon: 'nutrition',
    items: ['حفنة لوز', 'تفاحة'],
    kcal: '≈ ١٥٠ سعرة',
  },
  {
    id: 'lunch',
    label: 'الغداء',
    time: '١:٠٠ – ٣:٠٠ م',
    icon: 'lunch_dining',
    items: ['صدر دجاج مشوي', 'أرز بني', 'سلطة خضراء', 'زبادي'],
    kcal: '≈ ٦٠٠ سعرة',
  },
  {
    id: 'snack2',
    label: 'وجبة خفيفة',
    time: '٥:٠٠ م',
    icon: 'nutrition',
    items: ['جزر وخيار', 'كوب شاي أخضر'],
    kcal: '≈ ١٠٠ سعرة',
  },
  {
    id: 'dinner',
    label: 'العشاء',
    time: '٨:٠٠ – ٩:٣٠ م',
    icon: 'dinner_dining',
    items: ['سمك مشوي', 'خضار مطهوة بالبخار', 'خبز أسمر'],
    kcal: '≈ ٤٠٠ سعرة',
  },
];

const DIET_TIPS = [
  'قلّل الملح إلى أقل من ٥ غرام يومياً.',
  'تجنب المشروبات الغازية والسكريات المضافة.',
  'اشرب من ٦ إلى ٨ أكواب ماء يومياً.',
  'فضّل الحبوب الكاملة والبروتين قليل الدهون.',
];

const MEASURE_GUIDES = {
  bp: {
    label: 'ضغط الدم',
    icon: 'vital_signs',
    steps: [
      'اجلس وارتاح ٥ دقائق قبل القياس.',
      'ضع الكف على طاولة بمستوى القلب وارفع الكم.',
      'ضع الحزام على الجلد أعلى الذراع مباشرة.',
      'شغّل الجهاز ولا تتكلم أو تتحرك أثناء القياس.',
      'سجّل القراءتين الانقباضية والانبساطية.',
      'خُذ قراءتين بفاصل دقيقة واعتمد المتوسط.',
    ],
    tip: 'تجنّب القهوة والتدخين والرياضة قبل القياس بنحو ٣٠ دقيقة.',
  },
  sugar: {
    label: 'سكر الدم',
    icon: 'glucose',
    steps: [
      'اغسل يديك وجففهما جيداً.',
      'جهّز الجهاز والشريط وإبرة الوخز.',
      'اوخز جانب الإصبع للحصول على قطرة دم.',
      'ضع القطرة على الشريط وانتظر النتيجة.',
      'سجّل القراءة والوقت (صائم أو بعد الأكل).',
      'تخلص من الإبرة في وعاء آمن.',
    ],
    tip: 'غالباً يُقاس السكر صائماً أو بعد ساعتين من الطعام حسب توصية الطبيب.',
  },
};

const ARABIC_DIGITS = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨'];

function defaultStartDate() {
  const d = new Date();
  d.setDate(d.getDate() - DEFAULT_DAYS);
  return d.toISOString();
}

function loadState(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { tasks: parsed, startDate: defaultStartDate() };
    }
    if (parsed && Array.isArray(parsed.tasks)) {
      return {
        tasks: parsed.tasks,
        startDate: parsed.startDate || defaultStartDate(),
      };
    }
  } catch {}
  return null;
}

function ProgressRing({ value }) {
  const size = 128;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="recovery-ring" role="img" aria-label={`نسبة الإنجاز ${value}٪`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        className="recovery-ring__track"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="recovery-ring__fill"
      />
      <text x="50%" y="47%" textAnchor="middle" className="recovery-ring__value">{value}٪</text>
      <text x="50%" y="62%" textAnchor="middle" className="recovery-ring__label">من الخطة</text>
    </svg>
  );
}

export default function RecoveryPlanTab({ userEmail = '' }) {
  const storageKey = `${STORAGE_PREFIX}${userEmail || 'guest'}`;

  const [state, setState] = useState(() => (
    loadState(storageKey) || {
      tasks: DEFAULT_TASKS.map(t => ({ ...t })),
      startDate: defaultStartDate(),
    }
  ));

  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [measureTab, setMeasureTab] = useState('bp');

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }, [state, storageKey]);

  const { tasks, startDate } = state;

  const doneTasks = tasks.filter(t => t.done).length;
  const progress = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const dayCount = useMemo(() => {
    const start = new Date(startDate).getTime();
    if (Number.isNaN(start)) return 1;
    return Math.max(1, Math.floor((Date.now() - start) / 86400000) + 1);
  }, [startDate]);

  const remainingDays = Math.max(0, PLAN_DAYS - dayCount);

  const currentPhaseIndex = useMemo(() => {
    let idx = 0;
    PHASES.forEach((phase, i) => {
      if (progress >= phase.minProgress) idx = i;
    });
    return idx;
  }, [progress]);

  const goals = useMemo(
    () => BASE_GOALS.map(g => (g.dynamic === 'adherence' ? { ...g, value: progress } : g)),
    [progress]
  );

  const toggleTask = (id) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)),
    }));
  };

  const removeTask = (id) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
  };

  const addTask = (e) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text) return;
    setState(prev => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        { id: Date.now(), text, detail: 'مهمة مخصصة', icon: 'task_alt', done: false },
      ],
    }));
    setNewTask('');
    setShowAdd(false);
  };

  const nextAppointment = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  }, []);

  const activePhase = PHASES[currentPhaseIndex];

  return (
    <div className="recovery-page">
      {/* ── Header ───────────────────────────── */}
      <div className="recovery-header">
        <div>
          <h2 className="recovery-header__title">
            <span className="material-symbols-outlined">healing</span>
            خطة التعافي
          </h2>
          <p className="recovery-header__sub">تابع تقدمك يوماً بيوم حتى تعود إلى أفضل حالاتك</p>
        </div>
        <div className="recovery-header__actions">
          <span className="recovery-day-badge">
            <span className="material-symbols-outlined">calendar_month</span>
            اليوم {dayCount} من الخطة
          </span>
          <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>
            <span className="material-symbols-outlined">{showAdd ? 'close' : 'add'}</span>
            {showAdd ? 'إغلاق' : 'إضافة مهمة'}
          </button>
        </div>
      </div>

      {/* ── Hero ─────────────────────────────── */}
      <div className="recovery-hero">
        <ProgressRing value={progress} />

        <div className="recovery-hero__body">
          <span className="recovery-hero__eyebrow">المرحلة الحالية</span>
          <h3 className="recovery-hero__phase">{activePhase.title}</h3>
          <p className="recovery-hero__hint">{activePhase.desc}</p>

          <div className="recovery-hero__bar">
            <div className="recovery-hero__bar-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="recovery-hero__meta">
            <span><strong>{doneTasks}</strong> من <strong>{tasks.length}</strong> مهام مكتملة</span>
            <span><strong>{currentPhaseIndex}</strong> من {PHASES.length} مراحل مكتملة</span>
          </div>
        </div>

        <div className="recovery-hero__aside">
          <div className="recovery-mini">
            <div className="recovery-mini__val">{dayCount}</div>
            <div className="recovery-mini__lbl">يوم في التعافي</div>
          </div>
          <div className="recovery-mini">
            <div className="recovery-mini__val">{remainingDays}</div>
            <div className="recovery-mini__lbl">يوم متبقٍ</div>
          </div>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────── */}
      <div className="recovery-grid">
        <div className="recovery-col recovery-col--main">
          {/* Daily checklist */}
          <div className="section-card">
            <div className="section-card__header">
              <div className="section-card__title">
                <span className="material-symbols-outlined">checklist</span>
                مهام التعافي اليومية
              </div>
              <span className="section-card__badge">{doneTasks} / {tasks.length}</span>
            </div>

            {showAdd && (
              <form className="recovery-add" onSubmit={addTask}>
                <input
                  autoFocus
                  value={newTask}
                  onChange={e => setNewTask(e.target.value)}
                  placeholder="اكتب مهمة جديدة..."
                  aria-label="مهمة جديدة"
                />
                <button type="submit" className="recovery-add__save">إضافة</button>
                <button
                  type="button"
                  className="recovery-add__cancel"
                  onClick={() => { setShowAdd(false); setNewTask(''); }}
                >
                  إلغاء
                </button>
              </form>
            )}

            <div className="recovery-tasks">
              {tasks.length === 0 ? (
                <div className="recovery-empty">
                  <span className="material-symbols-outlined">playlist_add</span>
                  <p>لا توجد مهام بعد. أضف أول مهمة لخطتك.</p>
                </div>
              ) : tasks.map(task => (
                <div key={task.id} className={`recovery-task ${task.done ? 'done' : ''}`}>
                  <button
                    className="recovery-task__check"
                    onClick={() => toggleTask(task.id)}
                    aria-label={task.done ? 'إلغاء الإنجاز' : 'تحديد كمكتمل'}
                  >
                    {task.done && <span className="material-symbols-outlined">check</span>}
                  </button>

                  <div className="recovery-task__icon">
                    <span className="material-symbols-outlined">{task.icon}</span>
                  </div>

                  <div className="recovery-task__info">
                    <div className="recovery-task__text">{task.text}</div>
                    <div className="recovery-task__detail">{task.detail}</div>
                  </div>

                  <button
                    className="recovery-task__delete"
                    onClick={() => removeTask(task.id)}
                    aria-label="حذف المهمة"
                    title="حذف"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Phases timeline */}
          <div className="section-card">
            <div className="section-card__header">
              <div className="section-card__title">
                <span className="material-symbols-outlined">route</span>
                مراحل التعافي
              </div>
              <span className="section-card__badge">{currentPhaseIndex + 1} / {PHASES.length}</span>
            </div>

            <div className="recovery-phases">
              {PHASES.map((phase, i) => {
                const status = i < currentPhaseIndex ? 'done' : i === currentPhaseIndex ? 'active' : 'upcoming';
                return (
                  <div key={phase.id} className={`recovery-phase recovery-phase--${status}`}>
                    <div className="recovery-phase__rail">
                      <div className="recovery-phase__dot">
                        <span className="material-symbols-outlined">
                          {status === 'done' ? 'check' : phase.icon}
                        </span>
                      </div>
                    </div>

                    <div className="recovery-phase__body">
                      <div className="recovery-phase__top">
                        <h4>{phase.title}</h4>
                        <span className={`recovery-phase__status recovery-phase__status--${status}`}>
                          {STATUS_LABEL[status]}
                        </span>
                      </div>
                      <p>{phase.desc}</p>
                      <span className="recovery-phase__range">{phase.start}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="recovery-col recovery-col--side">
          {/* Goals */}
          <div className="section-card">
            <div className="section-card__header">
              <div className="section-card__title">
                <span className="material-symbols-outlined">flag</span>
                أهداف التعافي
              </div>
            </div>

            <div className="recovery-goals">
              {goals.map(goal => (
                <div key={goal.id} className={`recovery-goal recovery-goal--${goal.color}`}>
                  <div className="recovery-goal__top">
                    <div className="recovery-goal__label">
                      <span className="material-symbols-outlined">{goal.icon}</span>
                      {goal.label}
                    </div>
                    <span className="recovery-goal__value">{goal.value}٪</span>
                  </div>
                  <div className="recovery-goal__track">
                    <div className="recovery-goal__fill" style={{ width: `${goal.value}%` }} />
                  </div>
                  <p className="recovery-goal__target">الهدف: {goal.target}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor note */}
          <div className="recovery-note">
            <div className="recovery-note__head">
              <span className="material-symbols-outlined">stethoscope</span>
              <div>
                <h4>ملاحظات الطبيب</h4>
                <p>د. أحمد محمد</p>
              </div>
            </div>
            <p className="recovery-note__text">
              الالتزام بمواعيد الدواء والقياسات اليومية هو أهم خطوة في خطتك.
              لا توقف أي دواء دون استشارة الطبيب، وسجّل أي أعراض جديدة.
            </p>
            <div className="recovery-note__appt">
              <span className="material-symbols-outlined">event</span>
              الموعد القادم: {nextAppointment}
            </div>
          </div>

          {/* Tip */}
          <div className="recovery-tip">
            <span className="material-symbols-outlined">lightbulb</span>
            <div>
              <h4>نصيحة اليوم</h4>
              <p>حتى لو شعرت بتحسن، استمر في اتباع الخطة؛ الانتظام هو مفتاح التعافي الكامل.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nutrition & measurement ───────────── */}
      <div className="recovery-extra-grid">
        {/* Diet plan */}
        <div className="section-card">
          <div className="section-card__header">
            <div className="section-card__title">
              <span className="material-symbols-outlined">restaurant_menu</span>
              النظام الغذائي اليومي
            </div>
            <span className="section-card__badge">≈ ١٦٠٠ سعرة</span>
          </div>

          <div className="recovery-meals">
            {MEALS.map(meal => (
              <div key={meal.id} className="recovery-meal">
                <div className="recovery-meal__icon">
                  <span className="material-symbols-outlined">{meal.icon}</span>
                </div>
                <div className="recovery-meal__body">
                  <div className="recovery-meal__top">
                    <h4>{meal.label}</h4>
                    <span className="recovery-meal__time">{meal.time}</span>
                  </div>
                  <div className="recovery-meal__items">
                    {meal.items.map(item => (
                      <span key={item} className="recovery-meal__item">{item}</span>
                    ))}
                  </div>
                </div>
                <span className="recovery-meal__kcal">{meal.kcal}</span>
              </div>
            ))}
          </div>

          <div className="recovery-diet-tips">
            <div className="recovery-diet-tips__title">
              <span className="material-symbols-outlined">tips_and_updates</span>
              نصائح غذائية
            </div>
            <ul>
              {DIET_TIPS.map(tip => (
                <li key={tip}>
                  <span className="material-symbols-outlined">check_circle</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Measurement guide */}
        <div className="section-card">
          <div className="section-card__header">
            <div className="section-card__title">
              <span className="material-symbols-outlined">monitor_heart</span>
              طريقة القياس الصحيحة
            </div>
            <div className="recovery-measure__tabs">
              {Object.entries(MEASURE_GUIDES).map(([key, guide]) => (
                <button
                  key={key}
                  className={`recovery-measure__tab ${measureTab === key ? 'active' : ''}`}
                  onClick={() => setMeasureTab(key)}
                >
                  <span className="material-symbols-outlined">{guide.icon}</span>
                  {guide.label}
                </button>
              ))}
            </div>
          </div>

          <div className="recovery-steps">
            {MEASURE_GUIDES[measureTab].steps.map((step, i) => (
              <div key={step} className="recovery-step">
                <span className="recovery-step__num">{ARABIC_DIGITS[i]}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>

          <div className="recovery-measure__tip">
            <span className="material-symbols-outlined">info</span>
            <p>{MEASURE_GUIDES[measureTab].tip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
