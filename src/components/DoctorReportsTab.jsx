// src/components/DoctorReportsTab.jsx
import React, { useMemo } from 'react';
import { PATIENT_STATUS } from '../utils/doctorPatients';
import { formatDate, formatReportDate } from '../utils/reportData';
import './DoctorReportsTab.css';

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function StatCard({ icon, tone, value, label }) {
  return (
    <div className={`doctor-reports-stat doctor-reports-stat--${tone}`}>
      <span className="material-symbols-outlined">{icon}</span>
      <div>
        <div className="doctor-reports-stat__value">{value}</div>
        <div className="doctor-reports-stat__label">{label}</div>
      </div>
    </div>
  );
}

export default function DoctorReportsTab({ patients = [], doctor }) {
  const doctorName = doctor?.fullName || doctor?.name || 'الطبيب';

  const stats = useMemo(() => {
    const today = todayISO();
    const byStatus = { stable: 0, followup: 0, new: 0 };
    let adherenceSum = 0;
    const conditionMap = new Map();

    patients.forEach((p) => {
      if (byStatus[p.status] != null) byStatus[p.status] += 1;
      adherenceSum += Number(p.adherence) || 0;

      const condition = (p.condition || 'غير محدد').trim();
      conditionMap.set(condition, (conditionMap.get(condition) || 0) + 1);
    });

    const conditions = Array.from(conditionMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percent: patients.length ? Math.round((count / patients.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const adherenceBuckets = [
      { id: 'high', label: 'التزام ممتاز (٨٠٪+)', count: 0, tone: 'green' },
      { id: 'mid', label: 'التزام متوسط (٦٠–٧٩٪)', count: 0, tone: 'amber' },
      { id: 'low', label: 'التزام منخفض (أقل من ٦٠٪)', count: 0, tone: 'red' },
    ];
    patients.forEach((p) => {
      const value = Number(p.adherence) || 0;
      if (value >= 80) adherenceBuckets[0].count += 1;
      else if (value >= 60) adherenceBuckets[1].count += 1;
      else adherenceBuckets[2].count += 1;
    });

    return {
      total: patients.length,
      byStatus,
      avgAdherence: patients.length ? Math.round(adherenceSum / patients.length) : 0,
      todayAppointments: patients.filter((p) => p.nextVisit === today).length,
      upcoming: patients.filter((p) => p.nextVisit && p.nextVisit > today).length,
      conditions,
      adherenceBuckets,
    };
  }, [patients]);

  const sortedPatients = useMemo(
    () => patients.slice().sort((a, b) => (Number(b.adherence) || 0) - (Number(a.adherence) || 0)),
    [patients]
  );

  return (
    <div className="doctor-reports-page" dir="rtl">
      <div className="doctor-reports-page__header">
        <div>
          <h2 className="doctor-reports-page__title">
            <span className="material-symbols-outlined">summarize</span>
            تقارير العيادة
          </h2>
          <p className="doctor-reports-page__sub">
            ملخص إحصائي لحالات المرضى والالتزام بالخطة العلاجية
          </p>
        </div>
        <div className="doctor-reports-page__actions">
          <button className="btn-primary" onClick={() => window.print()}>
            <span className="material-symbols-outlined">print</span>
            طباعة / حفظ PDF
          </button>
        </div>
      </div>

      <div className="doctor-reports-sheet">
        {/* Letterhead */}
        <header className="doctor-reports-letterhead">
          <div className="doctor-reports-letterhead__brand">
            <div className="doctor-reports-letterhead__logo">
              <span className="material-symbols-outlined">health_and_safety</span>
            </div>
            <div>
              <h3>DoseMe</h3>
              <p>تقرير العيادة الدوري</p>
            </div>
          </div>
          <div className="doctor-reports-letterhead__meta">
            <span>الطبيب</span>
            <strong>د. {doctorName.replace(/^د\.?\s*/, '')}</strong>
            <span>{doctor?.clinic || 'عيادة DoseMe'}</span>
            <span className="doctor-reports-letterhead__date">{formatReportDate()}</span>
          </div>
        </header>

        {/* KPIs */}
        <section className="doctor-reports-section">
          <h4 className="doctor-reports-section__title">
            <span className="material-symbols-outlined">analytics</span>
            نظرة عامة على المرضى
          </h4>
          <div className="doctor-reports-stats">
            <StatCard icon="groups" tone="blue" value={stats.total} label="إجمالي المرضى" />
            <StatCard icon="check_circle" tone="green" value={stats.byStatus.stable} label="حالة مستقرة" />
            <StatCard icon="priority_high" tone="amber" value={stats.byStatus.followup} label="بحاجة لمتابعة" />
            <StatCard icon="person_add" tone="cyan" value={stats.byStatus.new} label="مرضى جدد" />
            <StatCard icon="trending_up" tone="green" value={`${stats.avgAdherence}٪`} label="متوسط الالتزام" />
            <StatCard icon="event_upcoming" tone="blue" value={stats.upcoming} label="مواعيد قادمة" />
          </div>
        </section>

        <div className="doctor-reports-split">
          {/* Adherence distribution */}
          <section className="doctor-reports-section">
            <h4 className="doctor-reports-section__title">
              <span className="material-symbols-outlined">trending_up</span>
              توزيع الالتزام بالخطة
            </h4>
            <div className="doctor-reports-bars">
              {stats.adherenceBuckets.map((bucket) => {
                const percent = stats.total ? Math.round((bucket.count / stats.total) * 100) : 0;
                return (
                  <div key={bucket.id} className="doctor-reports-bar">
                    <div className="doctor-reports-bar__head">
                      <span>{bucket.label}</span>
                      <strong>{bucket.count} ({percent}٪)</strong>
                    </div>
                    <div className="doctor-reports-bar__track">
                      <div
                        className={`doctor-reports-bar__fill doctor-reports-bar__fill--${bucket.tone}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Conditions */}
          <section className="doctor-reports-section">
            <h4 className="doctor-reports-section__title">
              <span className="material-symbols-outlined">medical_information</span>
              توزيع الحالات
            </h4>
            {stats.conditions.length === 0 ? (
              <div className="doctor-reports-empty">
                <span className="material-symbols-outlined">group_off</span>
                <p>لا يوجد مرضى مسجّلون بعد.</p>
              </div>
            ) : (
              <div className="doctor-reports-bars">
                {stats.conditions.map((item) => (
                  <div key={item.name} className="doctor-reports-bar">
                    <div className="doctor-reports-bar__head">
                      <span>{item.name}</span>
                      <strong>{item.count} ({item.percent}٪)</strong>
                    </div>
                    <div className="doctor-reports-bar__track">
                      <div
                        className="doctor-reports-bar__fill doctor-reports-bar__fill--blue"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Patients table */}
        <section className="doctor-reports-section">
          <div className="doctor-reports-section__head">
            <h4 className="doctor-reports-section__title">
              <span className="material-symbols-outlined">table_rows</span>
              تفاصيل المرضى
            </h4>
            <span className="doctor-reports-section__badge">{stats.total} مريض</span>
          </div>

          {sortedPatients.length === 0 ? (
            <div className="doctor-reports-empty">
              <span className="material-symbols-outlined">person_search</span>
              <p>لا يوجد مرضى مسجّلون في قائمتك بعد.</p>
            </div>
          ) : (
            <div className="doctor-reports-table-wrap">
              <table className="doctor-reports-table">
                <thead>
                  <tr>
                    <th>المريض</th>
                    <th>الحالة</th>
                    <th>العمر</th>
                    <th>فصيلة الدم</th>
                    <th>الالتزام</th>
                    <th>آخر زيارة</th>
                    <th>الموعد القادم</th>
                    <th>حالة المتابعة</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPatients.map((patient) => {
                    const meta = PATIENT_STATUS[patient.status] || PATIENT_STATUS.new;
                    return (
                      <tr key={patient.id}>
                        <td>
                          <div className="doctor-reports-patient">
                            <span className="doctor-reports-patient__avatar">
                              {patient.name?.charAt(0) || '؟'}
                            </span>
                            <span>{patient.name || '—'}</span>
                          </div>
                        </td>
                        <td>{patient.condition || '—'}</td>
                        <td>{patient.age || '—'}</td>
                        <td>{patient.bloodType || '—'}</td>
                        <td>
                          <div className="doctor-reports-adherence">
                            <div className="doctor-reports-adherence__track">
                              <div
                                className="doctor-reports-adherence__fill"
                                style={{ width: `${Number(patient.adherence) || 0}%` }}
                              />
                            </div>
                            <span>{Number(patient.adherence) || 0}٪</span>
                          </div>
                        </td>
                        <td>{formatDate(patient.lastVisit)}</td>
                        <td>{formatDate(patient.nextVisit)}</td>
                        <td>
                          <span className={`doctor-reports-status doctor-reports-status--${meta.tone}`}>
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="doctor-reports-footer">
          <p>
            تقرير إحصائي أُنشئ تلقائياً من بيانات المرضى المسجّلة في بوابة DoseMe للأطباء،
            ويُستخدم لأغراض المتابعة الداخلية فقط.
          </p>
          <span>عدد المرضى: {stats.total}</span>
        </footer>
      </div>
    </div>
  );
}
