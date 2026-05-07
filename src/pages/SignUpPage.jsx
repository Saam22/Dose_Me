import React, { useState, useEffect } from 'react';
import Background from '../components/Background';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import './SignUpPage.css';

/* ── Blood type options ─────────────────────── */
const BLOOD_TYPES = ['-B', '+B', '-A', '+A', '-AB', '+AB', '-O', '+O'];

/* ── Step indicator ─────────────────────────── */
function StepBar({ current }) {
  const steps = [
    { n: 1, label: 'إنشاء حساب جديد' },
    { n: 2, label: 'البيانات الصحية الأساسية' },
    { n: 3, label: 'الملف الشخصي' },
  ];
  return (
    <div className="step-bar">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <div className={`step-item ${current >= s.n ? 'active' : ''} ${current > s.n ? 'done' : ''}`}>
            <div className="step-circle">
              {current > s.n
                ? <span className="material-symbols-outlined">check</span>
                : s.n}
            </div>
            <span className="step-label">{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line ${current > s.n ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── STEP 1: Account info ───────────────────── */
function Step1({ data, onChange, errors }) {
  return (
    <div className="step-body">
      <div className="su-logo-wrap">
        <div className="su-logo-icon">
          <span className="material-symbols-outlined">health_and_safety</span>
        </div>
      </div>
      <h2 className="su-title">مدير الرعاية</h2>
      <p className="su-subtitle">إبدأ رحلتك الصحية معنا اليوم</p>
      <div className="su-divider-text">إنشاء حساب جديد</div>

      <div className="su-field">
        <label>الاسم الكامل</label>
        <div className="su-input-wrap">
          <input
            type="text"
            placeholder="أدخل اسمك بالكامل"
            value={data.fullName}
            onChange={e => onChange('fullName', e.target.value)}
            className={errors.fullName ? 'err' : ''}
          />
          <span className="material-symbols-outlined su-input-icon">person</span>
        </div>
        {errors.fullName && <p className="su-err">{errors.fullName}</p>}
      </div>

      <div className="su-field">
        <label>البريد الإلكتروني</label>
        <div className="su-input-wrap">
          <input
            type="email"
            placeholder="example@health.com"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
            className={errors.email ? 'err' : ''}
          />
          <span className="material-symbols-outlined su-input-icon">mail</span>
        </div>
        {errors.email && <p className="su-err">{errors.email}</p>}
      </div>

      <div className="su-field">
        <label>رقم الهاتف المحمول</label>
        <div className="su-input-wrap">
          <input
            type="tel"
            placeholder="05XXXXXXXX"
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
            className={errors.phone ? 'err' : ''}
          />
          <span className="material-symbols-outlined su-input-icon">smartphone</span>
        </div>
        {errors.phone && <p className="su-err">{errors.phone}</p>}
      </div>

      <div className="su-field">
        <label>كلمة المرور</label>
        <div className="su-input-wrap">
          <input
            type="password"
            placeholder="••••••••"
            value={data.password}
            onChange={e => onChange('password', e.target.value)}
            className={errors.password ? 'err' : ''}
          />
          <span className="material-symbols-outlined su-input-icon">lock</span>
        </div>
        {errors.password && <p className="su-err">{errors.password}</p>}
      </div>

      <label className="su-checkbox">
        <input
          type="checkbox"
          checked={data.terms}
          onChange={e => onChange('terms', e.target.checked)}
        />
        <span>أوافق على <button type="button" className="su-link">الشروط والأحكام الطبية</button></span>
      </label>
      {errors.terms && <p className="su-err">{errors.terms}</p>}
    </div>
  );
}

/* ── STEP 2: Medical info ───────────────────── */
function Step2({ data, onChange, errors }) {
  return (
    <div className="step-body">
      <div className="su-logo-wrap">
        <div className="su-logo-icon su-logo-icon--teal">
          <span className="material-symbols-outlined">medical_information</span>
        </div>
      </div>
      <h2 className="su-title">المعلومات الطبية</h2>
      <p className="su-subtitle">لقم بتخصيص تجربة DoseMe الشخصية بك بناءً على بياناتك الصحية الأساسية</p>

      <div className="su-field">
        <label>العمر</label>
        <div className="su-select-wrap">
          <select
            value={data.age}
            onChange={e => onChange('age', e.target.value)}
            className={errors.age ? 'err' : ''}
          >
            <option value="">اختر عمرك</option>
            {Array.from({ length: 83 }, (_, i) => i + 18).map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <span className="material-symbols-outlined su-select-icon">expand_more</span>
        </div>
        {errors.age && <p className="su-err">{errors.age}</p>}
      </div>

      <div className="su-row">
        <div className="su-field">
          <label>الطول (سم)</label>
          <input
            type="number"
            placeholder="170"
            value={data.height}
            onChange={e => onChange('height', e.target.value)}
            className={errors.height ? 'err' : ''}
          />
          {errors.height && <p className="su-err">{errors.height}</p>}
        </div>
        <div className="su-field">
          <label>الوزن (كجم)</label>
          <input
            type="number"
            placeholder="70"
            value={data.weight}
            onChange={e => onChange('weight', e.target.value)}
            className={errors.weight ? 'err' : ''}
          />
          {errors.weight && <p className="su-err">{errors.weight}</p>}
        </div>
      </div>

      <div className="su-field">
        <label>فصيلة الدم</label>
        <div className="blood-grid">
          {BLOOD_TYPES.map(bt => (
            <button
              key={bt}
              type="button"
              className={`blood-btn ${data.bloodType === bt ? 'selected' : ''}`}
              onClick={() => onChange('bloodType', bt)}
            >
              {bt}
            </button>
          ))}
        </div>
        {errors.bloodType && <p className="su-err">{errors.bloodType}</p>}
      </div>

      <p className="su-privacy-note">
        <span className="material-symbols-outlined">shield</span>
        بياناتك محمية ومشفرة وفق أعلى معايير الخصوصية الطبية
      </p>
    </div>
  );
}

/* ── STEP 3: Conditions & Meds ──────────────── */
const CONDITIONS_LIST = [
  { id: 'diabetes', label: 'السكري (النوع 2)', icon: 'glucose', color: 'red' },
  { id: 'bp',       label: 'ارتفاع ضغط الدم', icon: 'vital_signs', color: 'orange' },
  { id: 'heart',    label: 'أمراض القلب',      icon: 'cardiology', color: 'red' },
  { id: 'asthma',   label: 'الربو',             icon: 'pulmonology', color: 'blue' },
  { id: 'allergy',  label: 'حساسية البنسلين',  icon: 'allergies',  color: 'yellow' },
  { id: 'kidney',   label: 'أمراض الكلى',       icon: 'nephrology', color: 'purple' },
];

function Step3({ data, onChange }) {
  const toggle = (id) => {
    const cur = data.conditions || [];
    const next = cur.includes(id) ? cur.filter(c => c !== id) : [...cur, id];
    onChange('conditions', next);
  };
  const toggleMed = (id) => {
    const cur = data.allergies || [];
    const next = cur.includes(id) ? cur.filter(c => c !== id) : [...cur, id];
    onChange('allergies', next);
  };
  return (
    <div className="step-body">
      <div className="su-logo-wrap">
        <div className="su-logo-icon su-logo-icon--purple">
          <span className="material-symbols-outlined">person_4</span>
        </div>
      </div>
      <h2 className="su-title">الملف الصحي</h2>
      <p className="su-subtitle">اختر الحالات الصحية المزمنة إن وجدت</p>

      <div className="su-field">
        <label>الحالات الصحية</label>
        <div className="conditions-grid">
          {CONDITIONS_LIST.map(c => (
            <button
              key={c.id}
              type="button"
              className={`condition-btn condition-btn--${c.color} ${(data.conditions||[]).includes(c.id) ? 'selected' : ''}`}
              onClick={() => toggle(c.id)}
            >
              <span className="material-symbols-outlined">{c.icon}</span>
              <span>{c.label}</span>
              {(data.conditions||[]).includes(c.id) && (
                <span className="material-symbols-outlined condition-check">check_circle</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="su-field">
        <label>الأدوية الحالية (اختياري)</label>
        <div className="su-input-wrap">
          <input
            type="text"
            placeholder="مثال: ميتفورمين، أسبرين..."
            value={data.medications}
            onChange={e => onChange('medications', e.target.value)}
          />
          <span className="material-symbols-outlined su-input-icon">medication</span>
        </div>
      </div>

      <div className="su-field">
        <label>ملاحظات طبية إضافية</label>
        <textarea
          placeholder="أي معلومات إضافية تريد مشاركتها مع طبيبك..."
          value={data.notes}
          onChange={e => onChange('notes', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}

/* ══ MAIN SIGNUP PAGE ══════════════════════════ */
export default function SignUpPage({ onSuccess, onBack, isDark, onToggleTheme }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [btnState, setBtnState] = useState('idle');
  const { toast, showToast } = useToast();

  const [form, setForm] = useState({
    // step 1
    fullName: '', email: '', phone: '', password: '', terms: false,
    // step 2
    age: '', height: '', weight: '', bloodType: '',
    // step 3
    conditions: [], allergies: [], medications: '', notes: '',
  });

  const handleChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'الاسم مطلوب';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'بريد إلكتروني غير صحيح';
    if (form.phone.length < 9) e.phone = 'رقم الهاتف غير صحيح';
    if (form.password.length < 6) e.password = 'كلمة المرور 6 أحرف على الأقل';
    if (!form.terms) e.terms = 'يجب الموافقة على الشروط';
    return e;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.age) e.age = 'العمر مطلوب';
    if (!form.height) e.height = 'الطول مطلوب';
    if (!form.weight) e.weight = 'الوزن مطلوب';
    if (!form.bloodType) e.bloodType = 'اختر فصيلة الدم';
    return e;
  };

  const handleNext = async () => {
    if (step === 1) {
      const e = validateStep1();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    if (step === 2) {
      const e = validateStep2();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    if (step < 3) {
      setStep(s => s + 1);
      setErrors({});
      return;
    }
    // Final submit
    setBtnState('loading');
    await new Promise(r => setTimeout(r, 1800));
    setBtnState('success');
    showToast('🎉 تم إنشاء حسابك بنجاح!', 'success', 3000);
    setTimeout(() => onSuccess?.(form), 1200);
  };

  return (
    <div className="su-page" dir="rtl">
      <Background />
      <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

      <div className="su-wrapper">
        {/* Header */}
        <div className="su-header">
          <StepBar current={step} />
        </div>

        {/* Card */}
        <div className="su-card">
          {step === 1 && <Step1 data={form} onChange={handleChange} errors={errors} />}
          {step === 2 && <Step2 data={form} onChange={handleChange} errors={errors} />}
          {step === 3 && <Step3 data={form} onChange={handleChange} />}

          {/* Actions */}
          <div className="su-actions">
            {step > 1 && (
              <button className="su-btn-back" onClick={() => setStep(s => s - 1)}>
                <span className="material-symbols-outlined">arrow_forward</span>
                السابق
              </button>
            )}

            <button
              className={`su-btn-next ${btnState === 'success' ? 'success' : ''}`}
              onClick={handleNext}
              disabled={btnState === 'loading'}
            >
              {btnState === 'loading' && <span className="su-spinner" />}
              {btnState === 'success' && <span className="material-symbols-outlined">check_circle</span>}
              {btnState === 'idle' && (
                <>
                  {step === 3 ? 'إكمال الملف الشخصي' : 'التالي'}
                  <span className="material-symbols-outlined">arrow_back</span>
                </>
              )}
              {btnState === 'success' && 'تم!'}
            </button>
          </div>

          {/* Skip step 3 */}
          {step === 3 && (
            <button className="su-skip" onClick={() => onSuccess?.(form)}>
              تخطي هذه الخطوة حالياً
            </button>
          )}

          {/* Back to login */}
          <p className="su-login-link">
            لديك حساب بالفعل؟{' '}
            <button type="button" className="su-link" onClick={onBack}>
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>

      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  );
}