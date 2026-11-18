// src/pages/DoctorDashboardPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { loadPatients, savePatients, PATIENT_STATUS } from '../utils/doctorPatients';
import { getCarePlan, loadCarePlans, removeCarePlan, upsertCarePlan } from '../utils/carePlans';
import { DEFAULT_SPECIALTY } from '../utils/specialties';
import CarePlanBuilder from '../components/CarePlanBuilder';
import CarePlanSummary from '../components/CarePlanSummary';
import DoctorReportsTab from '../components/DoctorReportsTab';
import './DoctorDashboardPage.css';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function normalize(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

function emptyForm(specialty = '') {
  return {
    name: '', age: '', gender: 'ذكر', phone: '', email: '', condition: '',
    bloodType: 'O+', status: 'new', nextVisit: todayISO(),
    appointmentTime: '٠٩:٠٠ ص', notes: '', specialty,
  };
}

function StatusBadge({ status }) {
  const meta = PATIENT_STATUS[status] || PATIENT_STATUS.new;
  return <span className={`doctor-status doctor-status--${meta.tone}`}>{meta.label}</span>;
}

function AdherenceBar({ value }) {
  const tone = value >= 80 ? 'green' : value >= 60 ? 'amber' : 'red';
  return (
    <div className="doctor-adherence">
      <div className="doctor-adherence__track">
        <div
          className={`doctor-adherence__fill doctor-adherence__fill--${tone}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="doctor-adherence__value">{value}٪</span>
    </div>
  );
}

export default function DoctorDashboardPage({ doctor, onLogout }) {
  const doctorEmail = doctor?.email || 'guest';
  const rawName = doctor?.fullName || doctor?.name || 'الطبيب';
  const doctorSpecialty = doctor?.specialty || DEFAULT_SPECIALTY;

  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('doseme-theme') === 'dark'; } catch { return false; }
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState(() => loadPatients(doctorEmail));
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(() => emptyForm(doctorSpecialty));
  const [formError, setFormError] = useState('');
  const [plans, setPlans] = useState(() => loadCarePlans(doctorEmail));
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('doseme-theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  useEffect(() => {
    savePatients(doctorEmail, patients);
  }, [patients, doctorEmail]);

  const today = todayISO();

  const specialtyPatients = useMemo(
    () => (doctorSpecialty
      ? patients.filter(p => !p.specialty || p.specialty === doctorSpecialty)
      : patients),
    [patients, doctorSpecialty]
  );

  const todaysAppointments = useMemo(
    () => specialtyPatients.filter(p => p.nextVisit === today),
    [specialtyPatients, today]
  );
  const followups = useMemo(
    () => specialtyPatients.filter(p => p.status === 'followup'),
    [specialtyPatients]
  );
  const upcoming = useMemo(
    () => specialtyPatients
      .filter(p => p.nextVisit && p.nextVisit > today)
      .slice()
      .sort((a, b) => (a.nextVisit || '').localeCompare(b.nextVisit || '')),
    [specialtyPatients, today]
  );
  const avgAdherence = specialtyPatients.length
    ? Math.round(specialtyPatients.reduce((sum, p) => sum + (Number(p.adherence) || 0), 0) / specialtyPatients.length)
    : 0;

  const visiblePatients = useMemo(() => {
    const q = normalize(search);
    return specialtyPatients.filter(p => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (!q) return true;
      const haystack = normalize([p.name, p.condition, p.phone, p.notes].join(' '));
      return haystack.includes(q);
    });
  }, [specialtyPatients, search, filter]);

  const selectedPatient = patients.find(p => p.id === selectedId) || null;
  const selectedPlan = selectedPatient ? getCarePlan(plans, selectedPatient.id) : null;

  const closePatientFile = () => {
    setSelectedId(null);
    setShowPlanBuilder(false);
  };

  const savePlan = (plan) => {
    setPlans(upsertCarePlan(doctorEmail, plan));
    setShowPlanBuilder(false);
  };

  const deletePlan = () => {
    if (!selectedPatient) return;
    if (!window.confirm('هل تريد حذف خطة الرعاية لهذا المريض؟')) return;
    setPlans(removeCarePlan(doctorEmail, selectedPatient.id));
    setShowPlanBuilder(false);
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور';

  const displayName = rawName.startsWith('د') ? rawName : `د. ${rawName}`;
  const initials = rawName.replace(/^د\.?\s*/, '').charAt(0) || 'د';

  const openAdd = () => {
    setForm(emptyForm(doctorSpecialty));
    setFormError('');
    setShowAdd(true);
  };

  const submitAdd = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.condition.trim()) {
      setFormError('اسم المريض والحالة مطلوبان.');
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('البريد الإلكتروني غير صحيح.');
      return;
    }
    const newPatient = {
      ...form,
      id: Date.now(),
      name: form.name.trim(),
      condition: form.condition.trim(),
      age: Number(form.age) || 0,
      email: (form.email || '').trim(),
      specialty: form.specialty || doctorSpecialty,
      nextVisit: form.nextVisit || todayISO(),
      lastVisit: todayISO(),
      adherence: 100,
    };
    setPatients(prev => [newPatient, ...prev]);
    setShowAdd(false);
    setActiveTab('patients');
    setFilter('all');
    setSearch('');
  };

  const deletePatient = (id) => {
    if (!window.confirm('هل تريد حذف هذا المريض من قائمتك؟')) return;
    setPatients(prev => prev.filter(p => p.id !== id));
    setPlans(removeCarePlan(doctorEmail, id));
    closePatientFile();
  };

  const setField = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    if (formError) setFormError('');
  };

  const TABS = [
    { id: 'overview', label: 'لوحة التحكم', icon: 'dashboard' },
    { id: 'patients', label: 'المرضى', icon: 'groups' },
    { id: 'appointments', label: 'المواعيد', icon: 'event' },
    { id: 'reports', label: 'التقارير', icon: 'summarize' },
  ];

  const FILTERS = [
    { id: 'all', label: 'الكل' },
    { id: 'stable', label: 'مستقر' },
    { id: 'followup', label: 'يحتاج متابعة' },
    { id: 'new', label: 'جديد' },
  ];

  const renderPatientRow = (patient) => (
    <tr key={patient.id} onClick={() => setSelectedId(patient.id)}>
      <td>
        <div className="doctor-patient-cell">
          <div className="doctor-avatar">
            <span>{patient.name.charAt(0)}</span>
          </div>
          <div>
            <div className="doctor-patient-cell__name">{patient.name}</div>
            <div className="doctor-patient-cell__condition">{patient.condition}</div>
          </div>
        </div>
      </td>
      <td>{patient.age || '—'}</td>
      <td>{formatDate(patient.lastVisit)}</td>
      <td>{formatDate(patient.nextVisit)}</td>
      <td><AdherenceBar value={Number(patient.adherence) || 0} /></td>
      <td><StatusBadge status={patient.status} /></td>
      <td>
        <div className="doctor-row-actions">
          <a
            className="doctor-icon-btn"
            href={`tel:${patient.phone}`}
            onClick={e => e.stopPropagation()}
            title="اتصال"
            aria-label="اتصال بالمريض"
          >
            <span className="material-symbols-outlined">call</span>
          </a>
          <button
            className="doctor-icon-btn"
            onClick={e => { e.stopPropagation(); setSelectedId(patient.id); setShowPlanBuilder(true); }}
            title="خطة الرعاية"
            aria-label="خطة رعاية المريض"
          >
            <span className="material-symbols-outlined">assignment</span>
          </button>
          <button
            className="doctor-icon-btn"
            onClick={e => { e.stopPropagation(); setSelectedId(patient.id); }}
            title="عرض الملف"
            aria-label="عرض ملف المريض"
          >
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="doctor-page" dir="rtl">
      <nav className="doctor-nav">
        <div className="doctor-nav__logo">
          <div className="doctor-nav__logo-icon">
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <div className="doctor-nav__logo-text">
            <span>DoseMe</span>
            <small>بوابة الأطباء</small>
          </div>
        </div>

        <div className="doctor-nav__tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`doctor-nav__tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="doctor-nav__actions">
          <button
            className="doctor-nav__icon-btn"
            onClick={() => setIsDark(d => !d)}
            aria-label="تبديل الثيم"
            title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button className="doctor-nav__icon-btn" aria-label="الإشعارات" title="التنبيهات">
            <span className="material-symbols-outlined">notifications</span>
            {followups.length > 0 && <span className="doctor-nav__notif">{followups.length}</span>}
          </button>
          <div className="doctor-nav__profile" title={displayName}>
            <span className="doctor-nav__avatar">{initials}</span>
            <div className="doctor-nav__profile-text">
              <span>{displayName}</span>
              <small>{doctor?.specialty || 'طبيب'}</small>
            </div>
          </div>
          <button className="doctor-nav__icon-btn doctor-nav__logout" onClick={onLogout} aria-label="تسجيل الخروج" title="تسجيل الخروج">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </nav>

      <main className="doctor-main">
        <div className="doctor-header">
          <div>
            <h1 className="doctor-header__title">
              {greeting}، {displayName}
              {doctor?.specialty && <span className="doctor-header__badge">{doctor.specialty}</span>}
            </h1>
            <p className="doctor-header__sub">
              {doctor?.clinic || 'عيادة DoseMe'} • لديك <strong>{todaysAppointments.length}</strong> مواعيد اليوم
              و<strong>{followups.length}</strong> مرضى يحتاجون متابعة
            </p>
          </div>
          {activeTab === 'patients' && (
            <button className="btn-primary" onClick={openAdd}>
              <span className="material-symbols-outlined">person_add</span>
              إضافة مريض
            </button>
          )}
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="doctor-stats">
              <div className="doctor-stat doctor-stat--blue">
                <span className="material-symbols-outlined">groups</span>
                <div>
                  <div className="doctor-stat__val">{specialtyPatients.length}</div>
                  <div className="doctor-stat__lbl">إجمالي المرضى</div>
                </div>
              </div>
              <div className="doctor-stat doctor-stat--cyan">
                <span className="material-symbols-outlined">event_available</span>
                <div>
                  <div className="doctor-stat__val">{todaysAppointments.length}</div>
                  <div className="doctor-stat__lbl">مواعيد اليوم</div>
                </div>
              </div>
              <div className="doctor-stat doctor-stat--amber">
                <span className="material-symbols-outlined">assignment_late</span>
                <div>
                  <div className="doctor-stat__val">{followups.length}</div>
                  <div className="doctor-stat__lbl">يحتاجون متابعة</div>
                </div>
              </div>
              <div className="doctor-stat doctor-stat--green">
                <span className="material-symbols-outlined">trending_up</span>
                <div>
                  <div className="doctor-stat__val">{avgAdherence}٪</div>
                  <div className="doctor-stat__lbl">متوسط الالتزام</div>
                </div>
              </div>
            </div>

            <div className="doctor-grid">
              <div className="section-card">
                <div className="section-card__header">
                  <div className="section-card__title">
                    <span className="material-symbols-outlined">today</span>
                    مواعيد اليوم
                  </div>
                  <span className="section-card__badge">{todaysAppointments.length} موعد</span>
                </div>

                {todaysAppointments.length === 0 ? (
                  <div className="doctor-empty">
                    <span className="material-symbols-outlined">event_available</span>
                    <p>لا توجد مواعيد اليوم.</p>
                  </div>
                ) : (
                  <div className="doctor-appointments">
                    {todaysAppointments.map(p => (
                      <div key={p.id} className="doctor-appointment" onClick={() => setSelectedId(p.id)}>
                        <div className="doctor-appointment__time">{p.appointmentTime || '—'}</div>
                        <div className="doctor-avatar doctor-avatar--sm">
                          <span>{p.name.charAt(0)}</span>
                        </div>
                        <div className="doctor-appointment__info">
                          <div className="doctor-appointment__name">{p.name}</div>
                          <div className="doctor-appointment__condition">{p.condition}</div>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="section-card">
                <div className="section-card__header">
                  <div className="section-card__title">
                    <span className="material-symbols-outlined">priority_high</span>
                    يحتاجون متابعة
                  </div>
                  <button className="doctor-link-btn" onClick={() => { setActiveTab('patients'); setFilter('followup'); }}>
                    عرض الكل
                  </button>
                </div>

                {followups.length === 0 ? (
                  <div className="doctor-empty">
                    <span className="material-symbols-outlined">check_circle</span>
                    <p>كل مرضاك في حالة مستقرة.</p>
                  </div>
                ) : (
                  <div className="doctor-followups">
                    {followups.slice(0, 4).map(p => (
                      <div key={p.id} className="doctor-followup" onClick={() => setSelectedId(p.id)}>
                        <div className="doctor-avatar doctor-avatar--sm">
                          <span>{p.name.charAt(0)}</span>
                        </div>
                        <div className="doctor-followup__info">
                          <div className="doctor-followup__name">{p.name}</div>
                          <div className="doctor-followup__condition">{p.condition}</div>
                        </div>
                        <AdherenceBar value={Number(p.adherence) || 0} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'patients' && (
          <div className="section-card">
            <div className="doctor-toolbar">
              <div className="doctor-search">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو الحالة أو رقم الهاتف..."
                  aria-label="البحث في المرضى"
                />
              </div>
              <div className="doctor-filters">
                {FILTERS.map(item => (
                  <button
                    key={item.id}
                    className={`doctor-filter ${filter === item.id ? 'active' : ''}`}
                    onClick={() => setFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="doctor-results-count">{visiblePatients.length} مريض</span>
            </div>

            {visiblePatients.length === 0 ? (
              <div className="doctor-empty doctor-empty--lg">
                <span className="material-symbols-outlined">person_search</span>
                <h3>لا توجد نتائج مطابقة</h3>
                <p>جرّب اسماً آخر أو غيّر الفلتر.</p>
                <button className="doctor-secondary-btn" onClick={() => { setSearch(''); setFilter('all'); }}>
                  إعادة ضبط
                </button>
              </div>
            ) : (
              <div className="doctor-table-wrapper">
                <table className="doctor-table">
                  <thead>
                    <tr>
                      <th>المريض</th>
                      <th>العمر</th>
                      <th>آخر زيارة</th>
                      <th>الموعد القادم</th>
                      <th>الالتزام</th>
                      <th>الحالة</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>{visiblePatients.map(renderPatientRow)}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="doctor-appointments-grid">
            <div className="section-card">
              <div className="section-card__header">
                <div className="section-card__title">
                  <span className="material-symbols-outlined">today</span>
                  مواعيد اليوم
                </div>
                <span className="section-card__badge">{todaysAppointments.length} موعد</span>
              </div>
              {todaysAppointments.length === 0 ? (
                <div className="doctor-empty">
                  <span className="material-symbols-outlined">event_busy</span>
                  <p>لا توجد مواعيد اليوم.</p>
                </div>
              ) : (
                <div className="doctor-appointments">
                  {todaysAppointments.map(p => (
                    <div key={p.id} className="doctor-appointment" onClick={() => setSelectedId(p.id)}>
                      <div className="doctor-appointment__time">{p.appointmentTime || '—'}</div>
                      <div className="doctor-avatar doctor-avatar--sm">
                        <span>{p.name.charAt(0)}</span>
                      </div>
                      <div className="doctor-appointment__info">
                        <div className="doctor-appointment__name">{p.name}</div>
                        <div className="doctor-appointment__condition">{p.condition}</div>
                      </div>
                      <a
                        className="doctor-icon-btn"
                        href={`tel:${p.phone}`}
                        onClick={e => e.stopPropagation()}
                        title="اتصال"
                        aria-label="اتصال بالمريض"
                      >
                        <span className="material-symbols-outlined">call</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="section-card">
              <div className="section-card__header">
                <div className="section-card__title">
                  <span className="material-symbols-outlined">event_upcoming</span>
                  المواعيد القادمة
                </div>
                <span className="section-card__badge">{upcoming.length} موعد</span>
              </div>
              {upcoming.length === 0 ? (
                <div className="doctor-empty">
                  <span className="material-symbols-outlined">event_available</span>
                  <p>لا توجد مواعيد قادمة مسجلة.</p>
                </div>
              ) : (
                <div className="doctor-upcoming">
                  {upcoming.map(p => (
                    <div key={p.id} className="doctor-upcoming__item" onClick={() => setSelectedId(p.id)}>
                      <div className="doctor-upcoming__date">{formatDate(p.nextVisit)}</div>
                      <div className="doctor-upcoming__info">
                        <div className="doctor-upcoming__name">{p.name}</div>
                        <div className="doctor-upcoming__condition">{p.condition}</div>
                      </div>
                      <span className="doctor-upcoming__time">{p.appointmentTime || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <DoctorReportsTab patients={specialtyPatients} doctor={doctor} />
        )}
      </main>

      {selectedPatient && (
        <div className="doctor-modal" onClick={closePatientFile}>
          <div className="doctor-modal__card doctor-modal__card--file" onClick={e => e.stopPropagation()}>
            <button className="doctor-modal__close" onClick={closePatientFile} aria-label="إغلاق">
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="doctor-profile-head">
              <div className="doctor-avatar doctor-avatar--lg">
                <span>{selectedPatient.name.charAt(0)}</span>
              </div>
              <div>
                <span className="doctor-file-eyebrow">ملف المريض</span>
                <h2>{selectedPatient.name}</h2>
                <p>{selectedPatient.condition}</p>
                <StatusBadge status={selectedPatient.status} />
              </div>
            </div>

            <div className="doctor-profile-grid">
              <div className="doctor-profile-item">
                <span className="material-symbols-outlined">fingerprint</span>
                <div>
                  <small>رقم الملف</small>
                  <strong dir="ltr">
                    DM-{String(selectedPatient.id).padStart(6, '0').slice(-6)}
                  </strong>
                </div>
              </div>
              <div className="doctor-profile-item">
                <span className="material-symbols-outlined">mail</span>
                <div><small>البريد الإلكتروني</small><strong dir="ltr">{selectedPatient.email || '—'}</strong></div>
              </div>
              <div className="doctor-profile-item">
                <span className="material-symbols-outlined">medical_services</span>
                <div><small>التخصص</small><strong>{selectedPatient.specialty || doctorSpecialty}</strong></div>
              </div>
              <div className="doctor-profile-item">
                <span className="material-symbols-outlined">cake</span>
                <div><small>العمر</small><strong>{selectedPatient.age || '—'} سنة</strong></div>
              </div>
              <div className="doctor-profile-item">
                <span className="material-symbols-outlined">wc</span>
                <div><small>الجنس</small><strong>{selectedPatient.gender || '—'}</strong></div>
              </div>
              <div className="doctor-profile-item">
                <span className="material-symbols-outlined">water_drop</span>
                <div><small>فصيلة الدم</small><strong>{selectedPatient.bloodType || '—'}</strong></div>
              </div>
              <div className="doctor-profile-item">
                <span className="material-symbols-outlined">call</span>
                <div><small>الهاتف</small><strong dir="ltr">{selectedPatient.phone || '—'}</strong></div>
              </div>
              <div className="doctor-profile-item">
                <span className="material-symbols-outlined">history</span>
                <div><small>آخر زيارة</small><strong>{formatDate(selectedPatient.lastVisit)}</strong></div>
              </div>
              <div className="doctor-profile-item">
                <span className="material-symbols-outlined">event</span>
                <div><small>الموعد القادم</small><strong>{formatDate(selectedPatient.nextVisit)}</strong></div>
              </div>
            </div>

            <div className="doctor-profile-block">
              <div className="doctor-profile-block__title">الالتزام بالخطة</div>
              <AdherenceBar value={Number(selectedPatient.adherence) || 0} />
            </div>

            <div className="doctor-profile-block">
              <div className="doctor-profile-block__title">ملاحظات الطبيب</div>
              <p className="doctor-profile-notes">{selectedPatient.notes || 'لا توجد ملاحظات مسجلة.'}</p>
            </div>

            <CarePlanSummary
              plan={selectedPlan}
              onCreate={() => setShowPlanBuilder(true)}
              onEdit={() => setShowPlanBuilder(true)}
              onDelete={deletePlan}
            />

            <div className="doctor-modal__actions">
              <button className="doctor-secondary-btn" onClick={() => window.print()}>
                <span className="material-symbols-outlined">print</span>
                طباعة الملف
              </button>
              <a className="doctor-primary-link" href={`tel:${selectedPatient.phone}`}>
                <span className="material-symbols-outlined">call</span>
                اتصال بالمريض
              </a>
              <button className="doctor-danger-btn" onClick={() => deletePatient(selectedPatient.id)}>
                <span className="material-symbols-outlined">delete</span>
                حذف من القائمة
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="doctor-modal" onClick={() => setShowAdd(false)}>
          <div className="doctor-modal__card doctor-modal__card--form" onClick={e => e.stopPropagation()}>
            <button className="doctor-modal__close" onClick={() => setShowAdd(false)} aria-label="إغلاق">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="doctor-modal__title">إضافة مريض جديد</h2>
            <p className="doctor-modal__sub">أضف بيانات المريض إلى قائمتك الخاصة.</p>

            <form className="doctor-form" onSubmit={submitAdd}>
              <div className="doctor-form__grid">
                <label className="doctor-field">
                  <span>اسم المريض *</span>
                  <input value={form.name} onChange={setField('name')} placeholder="الاسم الكامل" />
                </label>
                <label className="doctor-field">
                  <span>العمر</span>
                  <input type="number" min="0" value={form.age} onChange={setField('age')} placeholder="45" />
                </label>
                <label className="doctor-field">
                  <span>الجنس</span>
                  <select value={form.gender} onChange={setField('gender')}>
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                </label>
                <label className="doctor-field">
                  <span>رقم الهاتف</span>
                  <input value={form.phone} onChange={setField('phone')} placeholder="01XXXXXXXXX" dir="ltr" />
                </label>
                <label className="doctor-field">
                  <span>البريد الإلكتروني (لربط الخطة بحساب المريض)</span>
                  <input value={form.email} onChange={setField('email')} placeholder="patient@example.com" dir="ltr" type="email" />
                </label>
                <label className="doctor-field doctor-field--wide">
                  <span>الحالة / التشخيص *</span>
                  <input value={form.condition} onChange={setField('condition')} placeholder="مثال: ارتفاع ضغط الدم" />
                </label>
                <label className="doctor-field">
                  <span>التخصص</span>
                  <input value={form.specialty} readOnly />
                </label>
                <label className="doctor-field">
                  <span>فصيلة الدم</span>
                  <select value={form.bloodType} onChange={setField('bloodType')}>
                    {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </label>
                <label className="doctor-field">
                  <span>الحالة</span>
                  <select value={form.status} onChange={setField('status')}>
                    <option value="new">مريض جديد</option>
                    <option value="followup">يحتاج متابعة</option>
                    <option value="stable">مستقر</option>
                  </select>
                </label>
                <label className="doctor-field">
                  <span>الموعد القادم</span>
                  <input type="date" value={form.nextVisit} onChange={setField('nextVisit')} />
                </label>
                <label className="doctor-field">
                  <span>وقت الموعد</span>
                  <input value={form.appointmentTime} onChange={setField('appointmentTime')} placeholder="٠٩:٠٠ ص" />
                </label>
                <label className="doctor-field doctor-field--wide">
                  <span>ملاحظات</span>
                  <textarea rows="2" value={form.notes} onChange={setField('notes')} placeholder="ملاحظات طبية مختصرة..." />
                </label>
              </div>

              {formError && (
                <p className="doctor-form__error">
                  <span className="material-symbols-outlined">error</span>
                  {formError}
                </p>
              )}

              <div className="doctor-form__actions">
                <button type="submit" className="doctor-primary-link">
                  <span className="material-symbols-outlined">save</span>
                  حفظ المريض
                </button>
                <button type="button" className="doctor-secondary-btn" onClick={() => setShowAdd(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPlanBuilder && selectedPatient && (
        <CarePlanBuilder
          patient={selectedPatient}
          doctor={doctor}
          initialPlan={selectedPlan}
          onSave={savePlan}
          onClose={() => setShowPlanBuilder(false)}
        />
      )}
    </div>
  );
}
