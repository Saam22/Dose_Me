// src/components/ReportsTab.jsx
import React, { useMemo } from 'react';
import {
  VITAL_STATUS_LABEL,
  formatDate,
  formatDateTime,
  formatReportDate,
  loadRecovery,
  loadUserProfile,
  loadVitals,
  summarizeRecovery,
  summarizeVitals,
} from '../utils/reportData';
import './ReportsTab.css';

function StatusPill({ status }) {
  const tone = status || 'none';
  return (
    <span className={`reports-pill reports-pill--${tone}`}>
      {VITAL_STATUS_LABEL[tone] || VITAL_STATUS_LABEL.none}
    </span>
  );
}

function MetricCard({ icon, label, value, unit, status, hint }) {
  return (
    <div className={`reports-metric reports-metric--${status || 'none'}`}>
      <div className="reports-metric__head">
        <span className="material-symbols-outlined">{icon}</span>
        <span className="reports-metric__label">{label}</span>
      </div>
      <div className="reports-metric__value">
        {value ?? '—'}
        {value != null && unit && <small>{unit}</small>}
      </div>
      <div className="reports-metric__foot">
        <StatusPill status={status} />
        {hint && <span className="reports-metric__hint">{hint}</span>}
      </div>
    </div>
  );
}

export default function ReportsTab({ userEmail = '', userFullName = '' }) {
  const profile = useMemo(() => loadUserProfile(userEmail), [userEmail]);
  const vitals = useMemo(() => loadVitals(userEmail), [userEmail]);
  const recovery = useMemo(() => loadRecovery(userEmail), [userEmail]);

  const summary = useMemo(() => summarizeVitals(vitals), [vitals]);
  const recoverySummary = useMemo(() => summarizeRecovery(recovery), [recovery]);

  const name = profile?.fullName || profile?.name || userFullName || 'المستخدم';
  const conditions = profile?.conditions || profile?.chronic || [];
  const allergies = profile?.allergies || [];
  const reportDate = formatReportDate();

  const recentVitals = useMemo(
    () => vitals.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10),
    [vitals]
  );

  return (
    <div className="reports-page" dir="rtl">
      <div className="reports-page__header">
        <div>
          <h2 className="reports-page__title">
            <span className="material-symbols-outlined">description</span>
            التقارير الطبية
          </h2>
          <p className="reports-page__sub">
            ملخص شامل لمؤشراتك الحيوية والتزامك بخطة التعافي
          </p>
        </div>
        <div className="reports-page__actions">
          <button className="btn-primary" onClick={() => window.print()}>
            <span className="material-symbols-outlined">print</span>
            طباعة / حفظ PDF
          </button>
        </div>
      </div>

      <div className="reports-sheet">
        {/* Letterhead */}
        <header className="reports-letterhead">
          <div className="reports-letterhead__brand">
            <div className="reports-letterhead__logo">
              <span className="material-symbols-outlined">health_and_safety</span>
            </div>
            <div>
              <h3>DoseMe</h3>
              <p>تقرير طبي شخصي</p>
            </div>
          </div>
          <div className="reports-letterhead__meta">
            <span>تاريخ الإصدار</span>
            <strong>{reportDate}</strong>
          </div>
        </header>

        {/* Patient info */}
        <section className="reports-section reports-section--info">
          <h4 className="reports-section__title">
            <span className="material-symbols-outlined">badge</span>
            بيانات المريض
          </h4>
          <div className="reports-info-grid">
            <div className="reports-info">
              <span>الاسم</span>
              <strong>{name}</strong>
            </div>
            <div className="reports-info">
              <span>البريد الإلكتروني</span>
              <strong dir="ltr">{userEmail || '—'}</strong>
            </div>
            <div className="reports-info">
              <span>العمر</span>
              <strong>{profile?.age ? `${profile.age} سنة` : '—'}</strong>
            </div>
            <div className="reports-info">
              <span>فصيلة الدم</span>
              <strong>{profile?.bloodType || '—'}</strong>
            </div>
            <div className="reports-info">
              <span>الحالات المزمنة</span>
              <strong>{conditions.length ? conditions.join('، ') : 'لا توجد'}</strong>
            </div>
            <div className="reports-info">
              <span>الحساسية</span>
              <strong>{allergies.length ? allergies.join('، ') : 'لا توجد'}</strong>
            </div>
          </div>
        </section>

        {/* Vitals summary */}
        <section className="reports-section">
          <div className="reports-section__head">
            <h4 className="reports-section__title">
              <span className="material-symbols-outlined">vital_signs</span>
              ملخص المؤشرات الحيوية
            </h4>
            <span className="reports-section__badge">{summary.count} قراءة مسجّلة</span>
          </div>

          <div className="reports-metrics">
            <MetricCard
              icon="vital_signs"
              label="ضغط الدم"
              value={
                summary.bp.avgSys != null || summary.bp.avgDia != null
                  ? `${summary.bp.avgSys ?? '—'}/${summary.bp.avgDia ?? '—'}`
                  : null
              }
              unit="mmHg"
              status={summary.bp.status}
              hint="متوسط القراءات"
            />
            <MetricCard
              icon="cardiology"
              label="نبض القلب"
              value={summary.heart.avg}
              unit="bpm"
              status={summary.heart.status}
              hint="متوسط القراءات"
            />
            <MetricCard
              icon="glucose"
              label="سكر الدم"
              value={summary.sugar.avg}
              unit="mg/dL"
              status={summary.sugar.status}
              hint="متوسط القراءات"
            />
            <MetricCard
              icon="monitor_weight"
              label="الوزن"
              value={summary.weight.avg}
              unit="كجم"
              status={summary.weight.status}
              hint="متوسط القراءات"
            />
          </div>
        </section>

        {/* Recovery plan */}
        <section className="reports-section">
          <div className="reports-section__head">
            <h4 className="reports-section__title">
              <span className="material-symbols-outlined">healing</span>
              الالتزام بخطة التعافي
            </h4>
            {recoverySummary.hasPlan && (
              <span className="reports-section__badge">{recoverySummary.progress}٪ إنجاز</span>
            )}
          </div>

          {!recoverySummary.hasPlan ? (
            <div className="reports-empty">
              <span className="material-symbols-outlined">playlist_add</span>
              <p>لم تبدأ خطة تعافٍ بعد. ابدأ من تبويب «خطة التعافي».</p>
            </div>
          ) : (
            <>
              <div className="reports-recovery">
                <div className="reports-recovery__progress">
                  <div className="reports-recovery__bar">
                    <div
                      className="reports-recovery__fill"
                      style={{ width: `${recoverySummary.progress}%` }}
                    />
                  </div>
                  <span>{recoverySummary.progress}٪</span>
                </div>
                <div className="reports-recovery__stats">
                  <div><small>المرحلة الحالية</small><strong>{recoverySummary.phaseTitle}</strong></div>
                  <div><small>اليوم</small><strong>{recoverySummary.dayCount}</strong></div>
                  <div><small>متبقٍ</small><strong>{recoverySummary.remainingDays} يوم</strong></div>
                  <div><small>المهام</small><strong>{recoverySummary.done} / {recoverySummary.total}</strong></div>
                </div>
              </div>

              <ul className="reports-tasks">
                {recoverySummary.tasks.map((task) => (
                  <li key={task.id} className={task.done ? 'is-done' : ''}>
                    <span className="material-symbols-outlined">
                      {task.done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>{task.text}</span>
                    {task.detail && <small>{task.detail}</small>}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Vitals log */}
        <section className="reports-section">
          <div className="reports-section__head">
            <h4 className="reports-section__title">
              <span className="material-symbols-outlined">history</span>
              سجل القراءات
            </h4>
            <span className="reports-section__badge">آخر {recentVitals.length} قراءة</span>
          </div>

          {recentVitals.length === 0 ? (
            <div className="reports-empty">
              <span className="material-symbols-outlined">monitor_heart</span>
              <p>لا توجد قراءات مسجّلة حتى الآن.</p>
            </div>
          ) : (
            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>ضغط الدم</th>
                    <th>النبض</th>
                    <th>السكر</th>
                    <th>الوزن</th>
                    <th>الحرارة</th>
                    <th>الأكسجين</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVitals.map((r) => {
                    const bp = r.systolic != null && r.diastolic != null
                      ? `${r.systolic}/${r.diastolic}`
                      : (r.systolic ?? r.diastolic ?? '—');
                    return (
                      <tr key={r.id ?? `${r.date}-${r.systolic}-${r.hr}`}>
                        <td>{formatDateTime(r.date)}</td>
                        <td>{bp}</td>
                        <td>{r.hr ?? '—'}</td>
                        <td>{r.sugar ?? '—'}</td>
                        <td>{r.weight ?? '—'}</td>
                        <td>{r.temp ?? '—'}</td>
                        <td>{r.oxygen ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="reports-footer">
          <p>
            هذا التقرير أُنشئ تلقائياً من بياناتك المسجّلة في DoseMe لغرض المتابعة الشخصية،
            ولا يُغني عن الاستشارة الطبية المتخصصة.
          </p>
          <span>آخر قراءة: {formatDate(summary.lastReading?.date)}</span>
        </footer>
      </div>
    </div>
  );
}
