import React, { useState, useEffect } from 'react';
import '../styles/theme.css';
import './AuthPages.css';

import Background from '../components/Background';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

/**
 * SignUpPage - صفحة إنشاء حساب جديد
 */
export default function SignUpPage({ onSuccess }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('doseme-theme') === 'dark'; }
    catch { return false; }
  });

  const [step, setStep] = useState(1); // 1: Basic Info, 2: Health Info, 3: Complete
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    age: '',
    weight: '',
    height: '',
    bloodType: '',
    chronicDiseases: [],
    allergies: [],
    medications: []
  });

  const { toast, showToast } = useToast();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('doseme-theme', isDark ? 'dark' : 'light'); }
    catch { /* storage unavailable */ }
  }, [isDark]);

  const toggleTheme = () => setIsDark(d => !d);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.password) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showToast('كلمات المرور غير متطابقة', 'error');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = () => {
    // Save to localStorage for demo
    localStorage.setItem('doseme-user', JSON.stringify(formData));
    showToast('تم إنشاء الحساب بنجاح! 🎉', 'success');
    setTimeout(() => {
      onSuccess?.(formData);
    }, 1500);
  };

  const toggleChronicDisease = (disease) => {
    setFormData(prev => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.includes(disease)
        ? prev.chronicDiseases.filter(d => d !== disease)
        : [...prev.chronicDiseases, disease]
    }));
  };

  return (
    <div className="auth-page" dir="rtl">
      <Background />
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      
      <div className="auth-container">
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <span>المعلومات الأساسية</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>المعلومات الطبية</span>
          </div>
          <div className="step-line" />
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>إكمال</span>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="auth-form fade-in">
            <div className="form-header">
              <div className="icon-circle">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <h2>إنشاء حساب جديد</h2>
              <p>أدخل معلوماتك الشخصية للبدء</p>
            </div>

            <div className="form-group">
              <label>الاسم الكامل</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined">person</span>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="أحمد محمد"
                />
              </div>
            </div>

            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined">email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@health.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label>رقم الهاتف</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined">phone</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="05XXXXXXXX"
                />
              </div>
            </div>

            <div className="form-group">
              <label>كلمة المرور</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined">lock</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="form-group">
              <label>تأكيد كلمة المرور</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined">lock</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button className="btn-primary" onClick={handleNext}>
              <span>التالي</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Step 2: Health Information */}
        {step === 2 && (
          <div className="auth-form fade-in">
            <div className="form-header">
              <div className="icon-circle">
                <span className="material-symbols-outlined">monitor_heart</span>
              </div>
              <h2>المعلومات الطبية</h2>
              <p>ساعدنا في فهم حالتك الصحية بشكل أفضل</p>
            </div>

            <div className="health-grid">
              <div className="form-group">
                <label>العمر (سنة)</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined">cake</span>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>الوزن (كجم)</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined">monitor_weight</span>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="70"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>الطول (سم)</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined">height</span>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    placeholder="175"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>فصيلة الدم</label>
                <div className="blood-types">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                    <button
                      key={type}
                      className={`blood-type-btn ${formData.bloodType === type ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, bloodType: type }))}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>الأمراض المزمنة (إن وجدت)</label>
              <div className="checkbox-grid">
                {['السكري', 'ارتفاع ضغط الدم', 'الربو', 'أمراض القلب'].map(disease => (
                  <label key={disease} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.chronicDiseases.includes(disease)}
                      onChange={() => toggleChronicDisease(disease)}
                    />
                    <span className="checkmark" />
                    {disease}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={handleBack}>
                <span className="material-symbols-outlined">arrow_back</span>
                <span>السابق</span>
              </button>
              <button className="btn-primary" onClick={handleNext}>
                <span>التالي</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="auth-form fade-in">
            <div className="form-header">
              <div className="icon-circle success">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h2>مراجعة المعلومات</h2>
              <p>تأكد من صحة البيانات قبل المتابعة</p>
            </div>

            <div className="info-summary">
              <div className="summary-section">
                <h4>المعلومات الشخصية</h4>
                <div className="summary-item">
                  <span className="material-symbols-outlined">person</span>
                  <div>
                    <strong>الاسم:</strong> {formData.fullName}
                  </div>
                </div>
                <div className="summary-item">
                  <span className="material-symbols-outlined">email</span>
                  <div>
                    <strong>البريد:</strong> {formData.email}
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h4>المعلومات الطبية</h4>
                <div className="summary-item">
                  <span className="material-symbols-outlined">monitor_heart</span>
                  <div>
                    <strong>العمر:</strong> {formData.age} سنة
                  </div>
                </div>
                <div className="summary-item">
                  <span className="material-symbols-outlined">bloodtype</span>
                  <div>
                    <strong>فصيلة الدم:</strong> {formData.bloodType}
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={handleBack}>
                <span className="material-symbols-outlined">arrow_back</span>
                <span>تعديل</span>
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                <span>إنشاء الحساب</span>
                <span className="material-symbols-outlined">check</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  );
}