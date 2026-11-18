// src/components/PatientFileTab.jsx
import React, { useMemo } from 'react';
import CarePlanSummary from './CarePlanSummary';
import {
  VITAL_STATUS_LABEL,
  formatDate,
  loadRecovery,
  loadUserProfile,
  loadVitals,
  summarizeRecovery,
  summarizeVitals,
} from '../utils/reportData';
import { loadPatientCarePlan } from '../utils/carePlans';
import './PatientFileTab.css';

const CHRONIC_LABELS = {
  diabetes: 'السكري (النوع 2)',
  bp: 'ارتفاع ضغط الدم',
  heart: 'أمراض القلب',
  asthma: 'الربو',
  allergy: 'حساسية البنسلين',
  kidney: 'الفشل الكلوي',
};

function fileNumber(email) {
  const raw = (email || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) % 1000000;
  }
  return `DM-${String(hash || 1).padStart(6, '0')}`;
}

export default function PatientFileTab({ userEmail = '', userFullName = '' }) {
  const profile = useMemo(() => loadUserProfile(userEmail) || {}, [userEmail]);
  const readings = useMemo(() => loadVitals(userEmail), [userEmail]);
  const recovery = useMemo(() => summarizeRecovery(loadRecovery(userEmail)), [userEmail]);
  const carePlan = useMemo(() => loadPatientCarePlan(userEmail), [userEmail]);
  const vitals = useMemo(() => summarizeVitals(readings), [readings]);

  const name = profile.fullName || profile.name || userFullName || 'المستخدم';
  const email = profile.email || userEmail || '';
  const chronic = (profile.chronic || []).map((id) => CHRONIC_LABELS[id] || id);

  const bmi = profile.height && profile.weight
    ? (Number(profile.weight) / Math.pow(Number(profile.height) / 100, 2)).toFixed(1)
    : '';

  const vitalItems = [
    {
      key: 'bp',
      label: 'ضغط الدم',
      icon: 'vital_signs',
      value: vitals.bp.latest
        ? `${vitals.bp.latest.systolic ?? '—'}/${vitals.bp.latest.diastolic ?? '—'}`
        : '—',
      unit: 'mmHg',
      status: vitals.bp.status,
      date: vitals.bp.latest?.date,
    },
    {
      key: 'heart',
      label: 'نبض القلب',
      icon: 'cardiology',
      value: vitals.heart.latest?.hr ?? '—',
      unit: 'bpm',
      status: vitals.heart.status,
      date: vitals.heart.latest?.date,
    },
    {
      key: 'sugar',
      label: 'سكر الدم',
      icon: 'glucose',
      value: vitals.sugar.latest?.sugar ?? '—',
      unit: 'mg/dL',
      status: vitals.sugar.status,
      date: vitals.sugar.latest?.date,
    },
    {
      key: 'weight',
      label: 'الوزن',
      icon: 'monitor_weight',
      value: vitals.weight.latest?.weight ?? '—',
      unit: 'كجم',
      status: vitals.weight.status,
      date: vitals.weight.latest?.date,
    },
  ];

  return (
    <div className="patient-file" dir="rtl">
      <div className="patient-file__header">
        <div>
          <h2 className="patient-file__title">
            <span className="material-symbols-outlined">folder_shared</span>
            الملف الطبي الموحد
          </h2>
          <p className="patient-file__sub">
            كل بياناتك الصحية في مكان واحد — جاهز للطباعة والمشاركة مع طبيبك.
          </p>
        </div>
        <button className="patient-file__print" onClick={() => window.print()}>
          <span className="material-symbols-outlined">print</span>
          طباعة الملف
        </button>
      </div>

      <section className="patient-file__card patient-file__identity">
        <div className="patient-file__avatar">{name.charAt(0)}</div>
        <div className="patient-file__who">
          <strong>{name}</strong>
          <span dir="ltr">{email || '—'}</span>
          <small dir="ltr">{fileNumber(email)}</small>
        </div>
        <div className="patient-file__badges">
          {profile.bloodType && <span>فصيلة الدم {profile.bloodType}</span>}
          {profile.age && <span>{profile.age} سنة</span>}
          {profile.gender && <span>{profile.gender}</span>}
        </div>
      </section>

      <div className="patient-file__grid">
        <section className="patient-file__card">
          <h3><span className="material-symbols-outlined">badge</span> البيانات الأساسية</h3>
          <dl className="patient-file__list">
            <div><dt>رقم الهاتف</dt><dd dir="ltr">{profile.phone || '—'}</dd></div>
            <div><dt>الطول</dt><dd>{profile.height ? `${profile.height} سم` : '—'}</dd></div>
            <div><dt>الوزن</dt><dd>{profile.weight ? `${profile.weight} كجم` : '—'}</dd></div>
            <div><dt>مؤشر كتلة الجسم</dt><dd>{bmi || '—'}</dd></div>
            <div><dt>تاريخ التسجيل</dt><dd>{formatDate(profile.createdAt)}</dd></div>
          </dl>
          {chronic.length > 0 && (
            <div className="patient-file__chronic">
              <small>الأمراض المزمنة</small>
              <div>
                {chronic.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="patient-file__card">
          <h3><span className="material-symbols-outlined">vital_signs</span> آخر المؤشرات الحيوية</h3>
          {readings.length === 0 ? (
            <p className="patient-file__empty">لم تسجّل أي قراءات بعد. ابدأ من تبويب «المؤشرات».</p>
          ) : (
            <div className="patient-file__vitals">
              {vitalItems.map((item) => (
                <div key={item.key} className={`patient-file__vital is-${item.status}`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <small>{item.label}</small>
                  <strong>{item.value} <em>{item.unit}</em></strong>
                  <span className="patient-file__vital-status">
                    {VITAL_STATUS_LABEL[item.status] || '—'}
                    {item.date ? ` • ${formatDate(item.date)}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="patient-file__card patient-file__card--wide">
          <h3><span className="material-symbols-outlined">assignment</span> خطة الرعاية من الطبيب</h3>
          {carePlan ? (
            <CarePlanSummary plan={carePlan} />
          ) : (
            <p className="patient-file__empty">
              لم يشارك طبيبك خطة رعاية بعد. ستظهر هنا تلقائياً بمجرد حفظها من بوابة الطبيب
              بعد ربط بريدك الإلكتروني بملفك.
            </p>
          )}
        </section>

        <section className="patient-file__card">
          <h3><span className="material-symbols-outlined">healing</span> خطة التعافي</h3>
          {recovery.hasPlan ? (
            <>
              <div className="patient-file__recovery">
                <strong>{recovery.progress}٪</strong>
                <span>{recovery.phaseTitle}</span>
              </div>
              <div className="patient-file__progress">
                <div style={{ width: `${recovery.progress}%` }} />
              </div>
              <dl className="patient-file__list">
                <div><dt>المهام المكتملة</dt><dd>{recovery.done} / {recovery.total}</dd></div>
                <div><dt>اليوم</dt><dd>{recovery.dayCount}</dd></div>
                <div><dt>الأيام المتبقية</dt><dd>{recovery.remainingDays}</dd></div>
              </dl>
            </>
          ) : (
            <p className="patient-file__empty">لم تبدأ خطة التعافي بعد.</p>
          )}
        </section>
      </div>
    </div>
  );
}
