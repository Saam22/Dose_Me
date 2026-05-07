import React, { useState, useEffect } from 'react';
import '../styles/theme.css';
import './ProfilePage.css';

import Background from '../components/Background';
import ThemeToggle from '../components/ThemeToggle';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

/**
 * ProfilePage - الملف الشخصي للمريض
 */
export default function ProfilePage({ userData }) {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('doseme-theme') === 'dark'; }
    catch { return false; }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(userData || {});
  
  const { toast, showToast } = useToast();

  useEffect(() => {
    // Load from localStorage if no userData passed
    if (!userData) {
      const saved = localStorage.getItem('doseme-user');
      if (saved) setProfileData(JSON.parse(saved));
    } else {
      setProfileData(userData);
    }
  }, [userData]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    try { localStorage.setItem('doseme-theme', isDark ? 'dark' : 'light'); }
    catch { /* storage unavailable */ }
  }, [isDark]);

  const toggleTheme = () => setIsDark(d => !d);

  const handleSave = () => {
    localStorage.setItem('doseme-user', JSON.stringify(profileData));
    setIsEditing(false);
    showToast('تم حفظ التغييرات بنجاح ✓', 'success');
  };

  const calculateBMI = () => {
    if (!profileData.weight || !profileData.height) return null;
    const heightInMeters = profileData.height / 100;
    return (profileData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return '';
    if (bmi < 18.5) return { text: 'نقص وزن', color: 'warning' };
    if (bmi < 25) return { text: 'طبيعي', color: 'success' };
    if (bmi < 30) return { text: 'زيادة وزن', color: 'warning' };
    return { text: 'سمنة', color: 'error' };
  };

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(bmi);

  return (
    <div className="profile-page" dir="rtl">
      <Background />
      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

      <div className="profile-container">
        {/* Header */}
        <header className="profile-header">
          <div className="header-content">
            <div className="user-avatar">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.fullName || 'User')}&background=0066ff&color=fff&size=128`}
                alt={profileData.fullName}
              />
              <button className="edit-avatar" onClick={() => setIsEditing(true)}>
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
            <div className="user-info">
              <h1>{profileData.fullName}</h1>
              <p className="user-id">DM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <div className="user-stats">
                <div className="stat-item">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>{profileData.age} سنة</span>
                </div>
                <div className="stat-item">
                  <span className="material-symbols-outlined">bloodtype</span>
                  <span>{profileData.bloodType}</span>
                </div>
                <div className="stat-item">
                  <span className="material-symbols-outlined">monitor_weight</span>
                  <span>{profileData.weight} كجم</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="btn-edit-profile" onClick={() => setIsEditing(!isEditing)}>
            <span className="material-symbols-outlined">{isEditing ? 'close' : 'edit'}</span>
            <span>{isEditing ? 'إلغاء' : 'تعديل الملف'}</span>
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>نظرة عامة</span>
          </button>
          <button 
            className={`tab ${activeTab === 'medical' ? 'active' : ''}`}
            onClick={() => setActiveTab('medical')}
          >
            <span className="material-symbols-outlined">medical_services</span>
            <span>المعلومات الطبية</span>
          </button>
          <button 
            className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <span className="material-symbols-outlined">activity</span>
            <span>النشاط</span>
          </button>
          <button 
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>الإعدادات</span>
          </button>
        </nav>

        {/* Content */}
        <main className="profile-content">
          {activeTab === 'overview' && (
            <div className="tab-content fade-in">
              {/* Health Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon bmi">
                    <span className="material-symbols-outlined">monitor_heart</span>
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">مؤشر كتلة الجسم</span>
                    <span className={`metric-value ${bmiStatus?.color}`}>{bmi}</span>
                    <span className="metric-status">{bmiStatus?.text}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon weight">
                    <span className="material-symbols-outlined">monitor_weight</span>
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">الوزن</span>
                    <span className="metric-value">{profileData.weight} كجم</span>
                    <span className="metric-status">طبيعي</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon height">
                    <span className="material-symbols-outlined">height</span>
                  </div>
                  <div className="metric-info">
                    <span className="metric-label">الطول</span>
                    <span className="metric-value">{profileData.height} سم</span>
                    <span className="metric-status">ثابت</span>
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="info-section">
                <h3>
                  <span className="material-symbols-outlined">info</span>
                  المعلومات الأساسية
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="material-symbols-outlined">email</span>
                    <div>
                      <strong>البريد الإلكتروني</strong>
                      <p>{profileData.email}</p>
                    </div>
                  </div>
                  <div className="info-item">
                    <span className="material-symbols-outlined">phone</span>
                    <div>
                      <strong>رقم الهاتف</strong>
                      <p>{profileData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chronic Diseases */}
              {profileData.chronicDiseases?.length > 0 && (
                <div className="info-section">
                  <h3>
                    <span className="material-symbols-outlined">warning</span>
                    الأمراض المزمنة
                  </h3>
                  <div className="tags-list">
                    {profileData.chronicDiseases.map(disease => (
                      <span key={disease} className="tag warning">
                        <span className="material-symbols-outlined">local_hospital</span>
                        {disease}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="tab-content fade-in">
              <div className="medical-info">
                <h3>
                  <span className="material-symbols-outlined">medical_services</span>
                  التفاصيل الطبية
                </h3>
                
                <div className="medical-grid">
                  <div className="medical-card">
                    <h4>فصيلة الدم</h4>
                    <div className="blood-type-display">
                      <span className="material-symbols-outlined">bloodtype</span>
                      <span className="blood-type">{profileData.bloodType}</span>
                    </div>
                  </div>

                  <div className="medical-card">
                    <h4>الأدوية النشطة</h4>
                    <div className="medications-list">
                      {profileData.medications?.length > 0 ? (
                        profileData.medications.map((med, idx) => (
                          <div key={idx} className="medication-item">
                            <span className="material-symbols-outlined">medication</span>
                            <span>{med}</span>
                          </div>
                        ))
                      ) : (
                        <p className="no-data">لا توجد أدوية مسجلة</p>
                      )}
                    </div>
                  </div>

                  <div className="medical-card full-width">
                    <h4>الحساسيات</h4>
                    <div className="allergies-list">
                      {profileData.allergies?.length > 0 ? (
                        profileData.allergies.map((allergy, idx) => (
                          <span key={idx} className="tag danger">
                            <span className="material-symbols-outlined">warning</span>
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <p className="no-data">لا توجد حساسيات مسجلة</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="tab-content fade-in">
              <div className="activity-section">
                <h3>
                  <span className="material-symbols-outlined">timeline</span>
                  النشاط الأخير
                </h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <strong>تم إنشاء الحساب</strong>
                      <p>مرحباً بك في DoseMe</p>
                      <span className="time">الآن</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content fade-in">
              <div className="settings-section">
                <h3>
                  <span className="material-symbols-outlined">settings</span>
                  الإعدادات
                </h3>
                
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="material-symbols-outlined">notifications</span>
                      <div>
                        <strong>الإشعارات</strong>
                        <p>تفعيل إشعارات التطبيقات</p>
                      </div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider" />
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="material-symbols-outlined">dark_mode</span>
                      <div>
                        <strong>الوضع الداكن</strong>
                        <p>تفعيل الوضع الداكن</p>
                      </div>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={isDark}
                        onChange={toggleTheme}
                      />
                      <span className="slider" />
                    </label>
                  </div>

                  <div className="setting-item danger">
                    <div className="setting-info">
                      <span className="material-symbols-outlined">delete</span>
                      <div>
                        <strong>حذف الحساب</strong>
                        <p>حذف حسابك نهائياً</p>
                      </div>
                    </div>
                    <button className="btn-danger">حذف</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Edit Modal */}
        {isEditing && (
          <div className="modal-overlay" onClick={() => setIsEditing(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>تعديل المعلومات</h3>
              
              <div className="form-group">
                <label>الاسم الكامل</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={e => setProfileData({...profileData, fullName: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e => setProfileData({...profileData, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>رقم الهاتف</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={e => setProfileData({...profileData, phone: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                  إلغاء
                </button>
                <button className="btn-primary" onClick={handleSave}>
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast msg={toast.msg} type={toast.type} visible={toast.visible} />
    </div>
  );
}