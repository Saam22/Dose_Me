// src/components/CarePlanBuilder.jsx
import React, { useMemo, useState } from 'react';
import { cleanRows, createDraft, makeRowId } from '../utils/carePlans';
import './CarePlan.css';

function toDraft(initialPlan, patient, doctor) {
  if (!initialPlan) return createDraft(patient, doctor);
  const ensure = (rows, factory) => {
    const list = Array.isArray(rows) && rows.length ? rows : [factory()];
    return list.map((row) => ({ ...row }));
  };
  return {
    ...initialPlan,
    patientEmail: initialPlan.patientEmail || patient?.email || '',
    goals: ensure(initialPlan.goals, () => ({ id: makeRowId('goal'), text: '' })),
    tasks: ensure(initialPlan.tasks, () => ({ id: makeRowId('task'), text: '', frequency: 'يومياً' })),
    medications: ensure(
      initialPlan.medications,
      () => ({ id: makeRowId('med'), name: '', dose: '', frequency: '' })
    ),
  };
}

export default function CarePlanBuilder({
  patient,
  doctor,
  initialPlan,
  onSave,
  onClose,
}) {
  const [draft, setDraft] = useState(() => toDraft(initialPlan, patient, doctor));
  const [error, setError] = useState('');

  const isEditing = Boolean(initialPlan);

  const patientLabel = useMemo(
    () => patient?.name || 'المريض',
    [patient]
  );

  const setField = (key) => (e) => {
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));
    if (error) setError('');
  };

  const updateRow = (field, id, key, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: prev[field].map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    }));
    if (error) setError('');
  };

  const addRow = (field, row) => {
    setDraft((prev) => ({ ...prev, [field]: [...prev[field], { id: makeRowId(field), ...row }] }));
  };

  const removeRow = (field, id) => {
    setDraft((prev) => ({ ...prev, [field]: prev[field].filter((row) => row.id !== id) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const goals = cleanRows(draft.goals);
    const tasks = cleanRows(draft.tasks);
    const medications = cleanRows(draft.medications);

    if (!(draft.diagnosis || '').trim()) {
      setError('يرجى إدخال التشخيص أو عنوان الخطة.');
      return;
    }
    if (!draft.startDate || !draft.endDate) {
      setError('يرجى تحديد تاريخ بداية ونهاية الخطة.');
      return;
    }
    if (draft.endDate < draft.startDate) {
      setError('تاريخ النهاية يجب أن يكون بعد تاريخ البداية.');
      return;
    }
    if (!goals.length && !tasks.length && !medications.length) {
      setError('أضف هدفاً أو مهمة أو دواءً واحداً على الأقل.');
      return;
    }
    const patientEmail = (draft.patientEmail || patient?.email || '').trim();
    if (patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
      setError('بريد المريض الإلكتروني غير صحيح.');
      return;
    }

    const now = new Date().toISOString();
    onSave?.({
      ...draft,
      patientId: String(patient?.id ?? draft.patientId),
      patientName: patient?.name || draft.patientName,
      patientEmail,
      diagnosis: draft.diagnosis.trim(),
      notes: (draft.notes || '').trim(),
      goals,
      tasks,
      medications,
      id: initialPlan?.id || `plan-${patient?.id ?? 'p'}-${Date.now()}`,
      createdAt: initialPlan?.createdAt || now,
      updatedAt: now,
    });
  };

  return (
    <div className="care-builder-overlay" onClick={onClose} dir="rtl">
      <div className="care-builder" onClick={(e) => e.stopPropagation()}>
        <button className="care-builder__close" onClick={onClose} aria-label="إغلاق">
          <span className="material-symbols-outlined">close</span>
        </button>

        <header className="care-builder__header">
          <div className="care-builder__icon">
            <span className="material-symbols-outlined">assignment_add</span>
          </div>
          <div>
            <h2>{isEditing ? 'تعديل خطة الرعاية' : 'منشئ خطة الرعاية'}</h2>
            <p>
              المريض: <strong>{patientLabel}</strong>
              {patient?.condition ? ` • ${patient.condition}` : ''}
            </p>
          </div>
        </header>

        <form className="care-builder__form" onSubmit={handleSubmit}>
          <div className="care-builder__grid">
            <label className="care-field care-field--wide">
              <span>التشخيص / عنوان الخطة *</span>
              <input
                value={draft.diagnosis}
                onChange={setField('diagnosis')}
                placeholder="مثال: ارتفاع ضغط الدم - المرحلة الأولى"
              />
            </label>
            <label className="care-field">
              <span>تاريخ البداية *</span>
              <input type="date" value={draft.startDate} onChange={setField('startDate')} />
            </label>
            <label className="care-field">
              <span>تاريخ النهاية *</span>
              <input type="date" value={draft.endDate} onChange={setField('endDate')} />
            </label>
            <label className="care-field care-field--wide">
              <span>بريد المريض الإلكتروني (لمزامنة الخطة مع حسابه)</span>
              <input
                type="email"
                dir="ltr"
                value={draft.patientEmail || ''}
                onChange={setField('patientEmail')}
                placeholder="patient@example.com"
              />
            </label>
            <label className="care-field care-field--wide">
              <span>ملاحظات وتوصيات الطبيب</span>
              <textarea
                rows="3"
                value={draft.notes}
                onChange={setField('notes')}
                placeholder="تعليمات عامة للمريض..."
              />
            </label>
          </div>

          {/* Goals */}
          <section className="care-block">
            <div className="care-block__head">
              <h3>
                <span className="material-symbols-outlined">flag</span>
                أهداف الخطة
              </h3>
              <button type="button" className="care-add" onClick={() => addRow('goals', { text: '' })}>
                <span className="material-symbols-outlined">add</span>
                هدف
              </button>
            </div>
            {draft.goals.map((goal) => (
              <div key={goal.id} className="care-row care-row--single">
                <input
                  value={goal.text}
                  onChange={(e) => updateRow('goals', goal.id, 'text', e.target.value)}
                  placeholder="مثال: الوصول بالضغط إلى أقل من 130/80"
                />
                <button
                  type="button"
                  className="care-remove"
                  onClick={() => removeRow('goals', goal.id)}
                  aria-label="حذف الهدف"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </section>

          {/* Tasks */}
          <section className="care-block">
            <div className="care-block__head">
              <h3>
                <span className="material-symbols-outlined">checklist</span>
                المهام اليومية
              </h3>
              <button
                type="button"
                className="care-add"
                onClick={() => addRow('tasks', { text: '', frequency: 'يومياً' })}
              >
                <span className="material-symbols-outlined">add</span>
                مهمة
              </button>
            </div>
            {draft.tasks.map((task) => (
              <div key={task.id} className="care-row">
                <input
                  value={task.text}
                  onChange={(e) => updateRow('tasks', task.id, 'text', e.target.value)}
                  placeholder="مثال: قياس ضغط الدم صباحاً"
                />
                <input
                  value={task.frequency}
                  onChange={(e) => updateRow('tasks', task.id, 'frequency', e.target.value)}
                  placeholder="التكرار (يومياً)"
                  className="care-row__short"
                />
                <button
                  type="button"
                  className="care-remove"
                  onClick={() => removeRow('tasks', task.id)}
                  aria-label="حذف المهمة"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </section>

          {/* Medications */}
          <section className="care-block">
            <div className="care-block__head">
              <h3>
                <span className="material-symbols-outlined">medication</span>
                الأدوية
              </h3>
              <button
                type="button"
                className="care-add"
                onClick={() => addRow('medications', { name: '', dose: '', frequency: '' })}
              >
                <span className="material-symbols-outlined">add</span>
                دواء
              </button>
            </div>
            {draft.medications.map((med) => (
              <div key={med.id} className="care-row care-row--med">
                <input
                  value={med.name}
                  onChange={(e) => updateRow('medications', med.id, 'name', e.target.value)}
                  placeholder="اسم الدواء"
                />
                <input
                  value={med.dose}
                  onChange={(e) => updateRow('medications', med.id, 'dose', e.target.value)}
                  placeholder="الجرعة"
                  className="care-row__short"
                />
                <input
                  value={med.frequency}
                  onChange={(e) => updateRow('medications', med.id, 'frequency', e.target.value)}
                  placeholder="التكرار"
                  className="care-row__short"
                />
                <button
                  type="button"
                  className="care-remove"
                  onClick={() => removeRow('medications', med.id)}
                  aria-label="حذف الدواء"
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
          </section>

          {error && (
            <p className="care-builder__error">
              <span className="material-symbols-outlined">error</span>
              {error}
            </p>
          )}

          <div className="care-builder__actions">
            <button type="submit" className="doctor-primary-link">
              <span className="material-symbols-outlined">save</span>
              {isEditing ? 'حفظ التعديلات' : 'إنشاء الخطة'}
            </button>
            <button type="button" className="doctor-secondary-btn" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
