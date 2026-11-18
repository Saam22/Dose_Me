// src/components/CarePlanSummary.jsx
import React from 'react';
import { formatDate } from '../utils/reportData';
import './CarePlan.css';

function isActive(plan) {
  if (!plan?.endDate) return false;
  const end = new Date(`${plan.endDate}T23:59:59`);
  return !Number.isNaN(end.getTime()) && end.getTime() >= Date.now();
}

export default function CarePlanSummary({ plan, onCreate, onEdit, onDelete }) {
  if (!plan) {
    return (
      <div className="care-plan care-plan--empty">
        <div className="care-plan__empty-icon">
          <span className="material-symbols-outlined">assignment</span>
        </div>
        <div className="care-plan__empty-text">
          <strong>لا توجد خطة رعاية لهذا المريض</strong>
          <span>أنشئ خطة تحتوي على الأهداف والمهام والأدوية لمتابعة الحالة.</span>
        </div>
        {onCreate && (
          <button className="care-plan__create" onClick={onCreate}>
            <span className="material-symbols-outlined">add_circle</span>
            إنشاء خطة رعاية
          </button>
        )}
      </div>
    );
  }

  const active = isActive(plan);

  return (
    <div className="care-plan">
      <div className="care-plan__head">
        <div className="care-plan__title">
          <span className="material-symbols-outlined">assignment</span>
          خطة الرعاية
        </div>
        <div className="care-plan__head-actions">
          <span className={`care-plan__status ${active ? 'is-active' : 'is-ended'}`}>
            {active ? 'نشطة' : 'منتهية'}
          </span>
          {onEdit && (
            <button className="care-plan__icon-btn" onClick={onEdit} title="تعديل الخطة" aria-label="تعديل الخطة">
              <span className="material-symbols-outlined">edit</span>
            </button>
          )}
          {onDelete && (
            <button
              className="care-plan__icon-btn care-plan__icon-btn--danger"
              onClick={onDelete}
              title="حذف الخطة"
              aria-label="حذف الخطة"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          )}
        </div>
      </div>

      <div className="care-plan__meta">
        <div>
          <small>التشخيص</small>
          <strong>{plan.diagnosis || '—'}</strong>
        </div>
        <div>
          <small>الطبيب</small>
          <strong>{plan.doctorName || '—'}</strong>
        </div>
        <div>
          <small>الفترة</small>
          <strong>{formatDate(plan.startDate)} — {formatDate(plan.endDate)}</strong>
        </div>
      </div>

      {plan.notes && (
        <p className="care-plan__notes">
          <span className="material-symbols-outlined">sticky_note_2</span>
          {plan.notes}
        </p>
      )}

      <div className="care-plan__lists">
        {plan.goals?.length > 0 && (
          <div className="care-plan__list">
            <h4>
              <span className="material-symbols-outlined">flag</span>
              الأهداف
              <span className="care-plan__count">{plan.goals.length}</span>
            </h4>
            <ul>
              {plan.goals.map((goal) => (
                <li key={goal.id}>{goal.text}</li>
              ))}
            </ul>
          </div>
        )}

        {plan.tasks?.length > 0 && (
          <div className="care-plan__list">
            <h4>
              <span className="material-symbols-outlined">checklist</span>
              المهام
              <span className="care-plan__count">{plan.tasks.length}</span>
            </h4>
            <ul>
              {plan.tasks.map((task) => (
                <li key={task.id}>
                  {task.text}
                  {task.frequency && <small>{task.frequency}</small>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {plan.medications?.length > 0 && (
          <div className="care-plan__list">
            <h4>
              <span className="material-symbols-outlined">medication</span>
              الأدوية
              <span className="care-plan__count">{plan.medications.length}</span>
            </h4>
            <ul>
              {plan.medications.map((med) => (
                <li key={med.id}>
                  {med.name}
                  <small>
                    {[med.dose, med.frequency].filter(Boolean).join(' • ')}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
