import React, { useState, useEffect } from 'react';
import Background from '../components/Background';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { SPECIALTIES } from '../utils/specialties';
import './SignUpPage.css';
// في أعلى الملف بعد import
// ── حفظ المستخدم في localStorage ──

function checkUserExists(email) {
  try {
    const users = JSON.parse(localStorage.getItem('doseme-users') || '{}');
    const key = (email || '').trim().toLowerCase();
    return Object.keys(users).some(k => k.trim().toLowerCase() === key);
  } catch {
    return false;
  }
}
function saveUser(email, password, userData) {
  try {
    const users = JSON.parse(localStorage.getItem('doseme-users') || '{}');
    users[email] = {
      pass: password,
      name: userData.fullName,
      fullName: userData.fullName,
      email,
      phone: userData.phone,
      role: userData.role || 'patient',
      age: userData.age,
      gender: userData.gender,
      height: userData.height,
      weight: userData.weight,
      bloodType: userData.bloodType,
      chronic: userData.chronic || [],
      specialty: userData.specialty || '',
      license: userData.license || '',
      clinic: userData.clinic || '',
      experience: userData.experience || '',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('doseme-users', JSON.stringify(users));
    console.log('✅ تم حفظ المستخدم:', email);
    return true;
  } catch (error) {
    console.error('❌ فشل الحفظ:', error);
    return false;
  }
}
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CHRONIC = [
  { id: 'diabetes', label: 'السكري (النوع 2)', icon: 'glucose' },
  { id: 'bp',       label: 'ارتفاع ضغط الدم', icon: 'vital_signs' },
  { id: 'heart',    label: 'أمراض القلب',      icon: 'cardiology' },
  { id: 'asthma',   label: 'الربو',             icon: 'pulmonology' },
  { id: 'allergy',  label: 'حساسية البنسلين',  icon: 'medication' },
  { id: 'kidney',   label: 'الفشل الكلوي',      icon: 'nephrology' },
];

function StepBar({ current, total }) {
  return (
    <div className="step-bar">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div className={`step-dot ${i < current ? 'done' : i === current ? 'active' : ''}`}>
            {i < current
              ? <span className="material-symbols-outlined">check</span>
              : <span>{i + 1}</span>}
          </div>
          {i < total - 1 && <div className={`step-line ${i < current ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Step1({ data, onChange, onPwToggle, pwVisible }) {
  return (
    <div className="su-step">
      <h2 className="su-title">إنشاء حساب جديد</h2>
      <p className="su-sub">ابدأ رحلتك الصحية معنا اليوم</p>
      <div className="su-role-grid">
        <button
          type="button"
          className={`su-role-btn ${(data.role || 'patient') === 'patient' ? 'active' : ''}`}
          onClick={() => onChange('role', 'patient')}
        >
          <span className="material-symbols-outlined">person</span>
          <span className="su-role-btn__text">
            <strong>مريض</strong>
            <small>متابعة صحتي وخطة التعافي</small>
          </span>
        </button>
        <button
          type="button"
          className={`su-role-btn ${data.role === 'doctor' ? 'active' : ''}`}
          onClick={() => onChange('role', 'doctor')}
        >
          <span className="material-symbols-outlined">stethoscope</span>
          <span className="su-role-btn__text">
            <strong>طبيب</strong>
            <small>لوحة تحكم وقائمة مرضى</small>
          </span>
        </button>
      </div>
      <div className="su-field">
        <label>الاسم الكامل</label>
        <div className="su-iw">
          <input type="text" placeholder={data.role === 'doctor' ? 'د. أدخل اسمك بالكامل' : 'أدخل اسمك بالكامل'}
            value={data.fullName} onChange={e => onChange('fullName', e.target.value)} />
          <span className="material-symbols-outlined">person</span>
        </div>
      </div>
      <div className="su-field">
        <label>البريد الإلكتروني</label>
        <div className="su-iw">
          <input type="email" placeholder="example@health.com"
            value={data.email} onChange={e => onChange('email', e.target.value)} />
          <span className="material-symbols-outlined">mail</span>
        </div>
      </div>
      <div className="su-field">
        <label>رقم الهاتف المحمول</label>
        <div className="su-iw">
          <input type="tel" placeholder="05XXXXXXXX" dir="ltr"
            value={data.phone} onChange={e => onChange('phone', e.target.value)} />
          <span className="material-symbols-outlined">smartphone</span>
        </div>
      </div>
      <div className="su-field">
        <label>كلمة المرور</label>
        <div className="su-iw">
          <input type={pwVisible ? 'text' : 'password'} placeholder="••••••••"
            value={data.password} onChange={e => onChange('password', e.target.value)} />
          <span className="material-symbols-outlined">lock</span>
          <button type="button" className="su-pw-toggle" onClick={onPwToggle}>
            <span className="material-symbols-outlined">{pwVisible ? 'visibility_off' : 'visibility'}</span>
          </button>
        </div>
      </div>
      <label className="su-checkbox">
        <input type="checkbox" checked={data.terms}
          onChange={e => onChange('terms', e.target.checked)} />
        <span>أوافق على <span className="text-blue">الشروط والأحكام الطبية</span></span>
      </label>
    </div>
  );
}

function Step2({ data, onChange }) {
  if (data.role === 'doctor') {
    return (
      <div className="su-step">
        <h2 className="su-title">بيانات الطبيب</h2>
        <p className="su-sub">أدخل تخصصك وبيانات الترخيص للوصول إلى بوابة الأطباء</p>

        <div className="su-row">
          <div className="su-field">
            <label>التخصص</label>
            <div className="su-iw">
              <select value={data.specialty || ''} onChange={e => onChange('specialty', e.target.value)}>
                <option value="">اختر التخصص</option>
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="su-field">
            <label>سنوات الخبرة</label>
            <div className="su-iw">
              <input type="number" min="0" placeholder="10"
                value={data.experience || ''} onChange={e => onChange('experience', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="su-field">
          <label>رقم الترخيص الطبي</label>
          <div className="su-iw">
            <input type="text" placeholder="EG-12345" dir="ltr"
              value={data.license || ''} onChange={e => onChange('license', e.target.value)} />
            <span className="material-symbols-outlined">badge</span>
          </div>
        </div>

        <div className="su-field">
          <label>العيادة / المستشفى</label>
          <div className="su-iw">
            <input type="text" placeholder="اسم العيادة أو المستشفى"
              value={data.clinic || ''} onChange={e => onChange('clinic', e.target.value)} />
            <span className="material-symbols-outlined">local_hospital</span>
          </div>
        </div>

        <div className="su-privacy">
          <span className="material-symbols-outlined">verified_user</span>
          سيتم التحقق من بيانات الترخيص قبل تفعيل بوابة الأطباء
        </div>
      </div>
    );
  }

  return (
    <div className="su-step">
      <h2 className="su-title">المعلومات الطبية</h2>
      <p className="su-sub">لقم بتخصيص تجربة DoseMe الخاصة بك بناءً على بياناتك الصحية الأساسية</p>

      <div className="su-row">
        <div className="su-field">
          <label>العمر</label>
          <div className="su-iw">
            <select value={data.age} onChange={e => onChange('age', e.target.value)}>
              <option value="">اختر عمرك</option>
              {Array.from({ length: 83 }, (_, i) => i + 18).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="su-field">
          <label>الجنس</label>
          <div className="su-radio-group">
            {['ذكر', 'أنثى'].map(g => (
              <label key={g} className={`su-radio ${data.gender === g ? 'active' : ''}`}>
                <input type="radio" name="gender" value={g}
                  checked={data.gender === g} onChange={() => onChange('gender', g)} />
                {g}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="su-row">
        <div className="su-field">
          <label>الطول (سم)</label>
          <div className="su-iw">
            <input type="number" placeholder="170"
              value={data.height} onChange={e => onChange('height', e.target.value)} />
          </div>
        </div>
        <div className="su-field">
          <label>الوزن (كجم)</label>
          <div className="su-iw">
            <input type="number" placeholder="70"
              value={data.weight} onChange={e => onChange('weight', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="su-field">
        <label>فصيلة الدم</label>
        <div className="blood-grid">
          {BLOOD_TYPES.map(bt => (
            <button key={bt} type="button"
              className={`blood-btn ${data.bloodType === bt ? 'active' : ''}`}
              onClick={() => onChange('bloodType', bt)}>{bt}</button>
          ))}
        </div>
      </div>

      <div className="su-field">
        <label>الأمراض المزمنة <span className="su-optional">(اختياري)</span></label>
        <div className="chronic-grid">
          {CHRONIC.map(c => (
            <label key={c.id}
              className={`chronic-chip ${(data.chronic || []).includes(c.id) ? 'active' : ''}`}>
              <input type="checkbox"
                checked={(data.chronic || []).includes(c.id)}
                onChange={e => {
                  const prev = data.chronic || [];
                  onChange('chronic', e.target.checked
                    ? [...prev, c.id] : prev.filter(x => x !== c.id));
                }} />
              <span className="material-symbols-outlined">{c.icon}</span>
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="su-privacy">
        <span className="material-symbols-outlined">shield_lock</span>
        بياناتك محمية ومشفرة وفق أعلى معايير الخصوصية الطبية
      </div>
    </div>
  );
}

function Step3({ data }) {
  if (data.role === 'doctor') {
    return (
      <div className="su-step su-step--done">
        <div className="done-avatar">
          <span className="done-avatar__letter">{(data.fullName || 'د').charAt(0)}</span>
          <div className="done-check"><span className="material-symbols-outlined">check</span></div>
        </div>
        <h2 className="su-title" style={{textAlign:'center'}}>تم إنشاء حساب الطبيب!</h2>
        <p className="su-sub" style={{textAlign:'center'}}>مرحباً {data.fullName}، بوابة الأطباء جاهزة</p>
        <div className="done-stats">
          <div className="done-stat">
            <span className="material-symbols-outlined">stethoscope</span>
            <div><div className="done-stat__val done-stat__val--sm">{data.specialty || '—'}</div><div className="done-stat__lbl">التخصص</div></div>
          </div>
          <div className="done-stat">
            <span className="material-symbols-outlined">badge</span>
            <div><div className="done-stat__val done-stat__val--sm">{data.license || '—'}</div><div className="done-stat__lbl">الترخيص</div></div>
          </div>
          <div className="done-stat">
            <span className="material-symbols-outlined">local_hospital</span>
            <div><div className="done-stat__val done-stat__val--sm">{data.clinic || '—'}</div><div className="done-stat__lbl">العيادة</div></div>
          </div>
        </div>
      </div>
    );
  }

  const bmi = data.height && data.weight
    ? (Number(data.weight) / Math.pow(Number(data.height) / 100, 2)).toFixed(1) : '—';
  return (
    <div className="su-step su-step--done">
      <div className="done-avatar">
        <span className="done-avatar__letter">{(data.fullName || 'م').charAt(0)}</span>
        <div className="done-check"><span className="material-symbols-outlined">check</span></div>
      </div>
      <h2 className="su-title" style={{textAlign:'center'}}>تم إنشاء ملفك بنجاح!</h2>
      <p className="su-sub" style={{textAlign:'center'}}>مرحباً {data.fullName}، ملفك الصحي جاهز</p>
      <div className="done-stats">
        <div className="done-stat">
          <span className="material-symbols-outlined">cake</span>
          <div><div className="done-stat__val">{data.age || '—'}</div><div className="done-stat__lbl">العمر</div></div>
        </div>
        <div className="done-stat">
          <span className="material-symbols-outlined">water_drop</span>
          <div><div className="done-stat__val">{data.bloodType || '—'}</div><div className="done-stat__lbl">فصيلة الدم</div></div>
        </div>
        <div className="done-stat">
          <span className="material-symbols-outlined">monitor_weight</span>
          <div><div className="done-stat__val">{bmi}</div><div className="done-stat__lbl">BMI</div></div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage({ onSuccess, onLoginClick }) {
  const [step, setStep] = useState(0);
  const [pwVisible, setPwVisible] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('doseme-theme') === 'dark'; } catch { return false; }
  });
  const { toast, showToast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', terms: false,
    role: 'patient',
    age: '', gender: '', height: '', weight: '', bloodType: '', chronic: [],
    specialty: '', license: '', clinic: '', experience: '',
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('doseme-theme', isDark ? 'dark' : 'light'); } catch {}
  }, [isDark]);

  const onChange = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const validate = () => {
    if (step === 0) {
      if (!formData.fullName.trim()) { showToast('الرجاء إدخال الاسم الكامل', 'error'); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { showToast('بريد إلكتروني غير صحيح', 'error'); return false; }
      if (checkUserExists(formData.email)) {
        showToast('هذا البريد مسجل مسبقاً. يرجى تسجيل الدخول', 'error');
        return false;
      }
      if (formData.password.length < 6) { showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error'); return false; }
      if (!formData.terms) { showToast('الرجاء الموافقة على الشروط والأحكام', 'error'); return false; }
    }
    if (step === 1) {
      if (formData.role === 'doctor') {
        if (!formData.specialty) { showToast('الرجاء اختيار التخصص', 'error'); return false; }
        if (!formData.license.trim()) { showToast('الرجاء إدخال رقم الترخيص الطبي', 'error'); return false; }
      } else {
        if (!formData.age) { showToast('الرجاء اختيار العمر', 'error'); return false; }
        if (!formData.bloodType) { showToast('الرجاء اختيار فصيلة الدم', 'error'); return false; }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;

    if (step < 2) {
      setStep(s => s + 1);
      return;
    }

    // ✅ حفظ المستخدم عند إتمام التسجيل
    const saved = saveUser(formData.email, formData.password, formData);

    if (saved) {
      showToast('تم إنشاء الحساب بنجاح! 🎉', 'success');
      setTimeout(() => {
        onSuccess?.(formData);
      }, 1000);
    } else {
      showToast('حدث خطأ في حفظ البيانات', 'error');
    }
  };
  const LABELS = ['إنشاء الحساب', 'البيانات الصحية', 'إنهاء الإعداد'];
  const BTNS   = ['إنشاء الحساب', 'إكمال الملف الشخصي', 'ابدأ الآن'];

  return (
    <div className="su-page" dir="rtl">
      <Background />
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} />
      <div className="su-center">
        <div className="su-card">
          <div className="su-card__header">
            <div className="su-logo-icon">
              <span className="material-symbols-outlined">health_and_safety</span>
            </div>
            <div>
              <div className="su-brand">مدير الرعاية</div>
              <div className="su-brand-sub">ابدأ رحلتك الصحية معنا اليوم</div>
            </div>
          </div>
          <StepBar current={step} total={3} />
          <p className="su-step-lbl">
            {step === 1 && formData.role === 'doctor' ? 'بيانات العيادة' : LABELS[step]}
          </p>
          {step === 0 && <Step1 data={formData} onChange={onChange} pwVisible={pwVisible} onPwToggle={() => setPwVisible(v => !v)} />}
          {step === 1 && <Step2 data={formData} onChange={onChange} />}
          {step === 2 && <Step3 data={formData} />}
          <button className="su-btn" onClick={handleNext}>
            <span className="material-symbols-outlined">arrow_back</span>
            {BTNS[step]}
          </button>
          {step === 1 && formData.role !== 'doctor' && (
            <button className="su-skip" onClick={() => setStep(2)}>تخطي هذه الخطوة حالياً</button>
          )}
          {step === 0 && (
            <p className="su-footer">
              لديك حساب بالفعل؟{' '}
              <button type="button" className="text-blue" onClick={onLoginClick}>تسجيل الدخول</button>
            </p>
          )}
        </div>
      </div>
      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  );
}
