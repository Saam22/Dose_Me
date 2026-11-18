// src/components/TreatmentPlanTab.jsx
import React, { useEffect, useMemo, useState } from 'react';
import CarePlanSummary from './CarePlanSummary';
import { formatDate, loadUserProfile } from '../utils/reportData';
import { loadPatientCarePlan } from '../utils/carePlans';
import './TreatmentPlanTab.css';

const STORAGE_PREFIX = 'doseme-treatment:';

const DEFAULT_CHECKLIST = [
  { id: 1, task: 'قياس ضغط الدم صباحاً', completed: true },
  { id: 2, task: 'تناول الدواء بعد الإفطار', completed: false },
  { id: 3, task: 'تسجيل القراءات في التطبيق', completed: true },
  { id: 4, task: 'ممارسة رياضة المشي ٣٠ دقيقة', completed: false },
  { id: 5, task: 'تجنب الأطعمة المالحة', completed: false },
];

const TIPS = [
  'لا توقف أي دواء أو تغيّر جرعته دون استشارة الطبيب.',
  'سجّل أي أعراض جديدة أو آثار جانبية فوراً في التطبيق.',
  'التزم بمواعيد القياس اليومية لمساعدة طبيبك على تقييم حالتك.',
  'احتفظ بمواعيد المتابعة الدورية ولا تتأخر عنها.',
];

function loadChecklist(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_CHECKLIST.map((item) => ({ ...item }));
}

function planChecklist(storageKey, doctorPlan) {
  const stored = loadChecklist(storageKey);
  const planTasks = (doctorPlan?.tasks || []).filter((task) => task.text);
  if (!planTasks.length) return stored;
  const doneMap = new Map(stored.map((task) => [String(task.id), Boolean(task.completed)]));
  return planTasks.map((task, i) => {
    const id = task.id || `task-${i}`;
    return {
      id,
      task: task.text,
      frequency: task.frequency || '',
      completed: doneMap.get(String(id)) || false,
    };
  });
}

function buildPlan(profile) {
  const conditions = profile?.conditions || profile?.chronic || [];
  const diagnosis = conditions.length
    ? conditions.join('، ')
    : 'ارتفاع ضغط الدم';

  let start = new Date(profile?.createdAt || Date.now());
  if (Number.isNaN(start.getTime())) start = new Date();
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 90);

  return {
    doctor: profile?.doctorName || 'د. أحمد محمد',
    diagnosis,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    notes: 'الالتزام بالجرعات المنتظمة، وقياس المؤشرات يومياً، وممارسة المشي ٣٠ دقيقة.',
  };
}

export default function TreatmentPlanTab({ userEmail = '' }) {
  const storageKey = `${STORAGE_PREFIX}${userEmail || 'guest'}`;
  const profile = useMemo(() => loadUserProfile(userEmail), [userEmail]);
  const doctorPlan = useMemo(() => loadPatientCarePlan(userEmail), [userEmail]);
  const plan = useMemo(() => (doctorPlan ? {
    doctor: doctorPlan.doctorName || 'طبيبك المعالج',
    diagnosis: doctorPlan.diagnosis || '—',
    startDate: doctorPlan.startDate,
    endDate: doctorPlan.endDate,
    notes: doctorPlan.notes || 'لا توجد ملاحظات.',
  } : buildPlan(profile)), [doctorPlan, profile]);

  const [checklist, setChecklist] = useState(() => planChecklist(storageKey, doctorPlan));

  useEffect(() => {
    setChecklist(planChecklist(storageKey, doctorPlan));
  }, [storageKey, doctorPlan]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(checklist)); } catch {}
  }, [checklist, storageKey]);

  const done = checklist.filter((t) => t.completed).length;
  const progress = checklist.length
    ? Math.round((done / checklist.length) * 100)
    : 0;

  const toggleTask = (id) => {
    setChecklist((prev) => prev.map((task) => (
      task.id === id ? { ...task, completed: !task.completed } : task
    )));
  };

  const resetChecklist = () => {
    const planTasks = (doctorPlan?.tasks || []).filter((task) => task.text);
    if (planTasks.length) {
      setChecklist(planTasks.map((task, i) => ({
        id: task.id || `task-${i}`,
        task: task.text,
        frequency: task.frequency || '',
        completed: false,
      })));
      return;
    }
    setChecklist(DEFAULT_CHECKLIST.map((item) => ({ ...item })));
  };

  return (
    <div className="treatment-page">
      <div className="treatment-page__header">
        <div>
          <h2 className="treatment-page__title">
            <span className="material-symbols-outlined">assignment</span>
            الخطة العلاجية
          </h2>
          <p className="treatment-page__sub">
            {doctorPlan
              ? 'خطة رعاية معتمدة من طبيبك مع قائمة المتابعة اليومية'
              : 'خطتك المعتمدة من الطبيب مع قائمة المتابعة اليومية'}
          </p>
        </div>
        <div className="treatment-progress-pill">
          <span className="material-symbols-outlined">task_alt</span>
          {progress}٪ إنجاز اليوم
        </div>
      </div>

      {/* Plan details */}
      {doctorPlan ? (
        <CarePlanSummary plan={doctorPlan} />
      ) : (
        <div className="treatment-plan-card">
          <div className="treatment-plan-card__item">
            <span className="material-symbols-outlined">stethoscope</span>
            <div>
              <small>الطبيب المعالج</small>
              <strong>{plan.doctor}</strong>
            </div>
          </div>
          <div className="treatment-plan-card__item">
            <span className="material-symbols-outlined">clinical_notes</span>
            <div>
              <small>التشخيص</small>
              <strong>{plan.diagnosis}</strong>
            </div>
          </div>
          <div className="treatment-plan-card__item">
            <span className="material-symbols-outlined">calendar_month</span>
            <div>
              <small>فترة العلاج</small>
              <strong>{formatDate(plan.startDate)} — {formatDate(plan.endDate)}</strong>
            </div>
          </div>
          <div className="treatment-plan-card__item treatment-plan-card__item--wide">
            <span className="material-symbols-outlined">lightbulb</span>
            <div>
              <small>ملاحظات الطبيب</small>
              <strong>{plan.notes}</strong>
            </div>
          </div>
        </div>
      )}

      <div className="treatment-grid">
        {/* Checklist */}
        <div className="section-card">
          <div className="section-card__header">
            <div className="section-card__title">
              <span className="material-symbols-outlined">checklist</span>
              قائمة المتابعة اليومية
            </div>
            <div className="treatment-checklist__actions">
              <span className="section-card__badge">{done} / {checklist.length}</span>
              <button className="treatment-reset" onClick={resetChecklist}>
                إعادة ضبط
              </button>
            </div>
          </div>

          <div className="treatment-progress">
            <div className="treatment-progress__track">
              <div className="treatment-progress__fill" style={{ width: `${progress}%` }} />
            </div>
            <span>{progress}٪</span>
          </div>

          <div className="treatment-checklist">
            {checklist.map((task) => (
              <label
                key={task.id}
                className={`treatment-check ${task.completed ? 'is-done' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                />
                <span className="treatment-check__box">
                  <span className="material-symbols-outlined">check</span>
                </span>
                <span className="treatment-check__text">{task.task}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="section-card">
          <div className="section-card__header">
            <div className="section-card__title">
              <span className="material-symbols-outlined">health_and_safety</span>
              تعليمات مهمة
            </div>
          </div>
          <ul className="treatment-tips">
            {TIPS.map((tip) => (
              <li key={tip}>
                <span className="material-symbols-outlined">verified</span>
                <p>{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
