// src/components/SymptomCheckerTab.jsx
import React, { useMemo, useState } from 'react';
import './SymptomCheckerTab.css';

const SYMPTOMS = [
  { id: 'chest', label: 'ألم في الصدر', icon: 'cardiology', red: true },
  { id: 'breath', label: 'ضيق في التنفس', icon: 'pulmonology', red: true },
  { id: 'faint', label: 'فقدان الوعي', icon: 'emergency', red: true },
  { id: 'bleeding', label: 'نزيف حاد', icon: 'bloodtype', red: true },
  { id: 'headache', label: 'صداع شديد', icon: 'psychology', red: false },
  { id: 'fever', label: 'حرارة مرتفعة', icon: 'thermostat', red: false },
  { id: 'dizzy', label: 'دوخة', icon: 'cyclone', red: false },
  { id: 'nausea', label: 'غثيان وقيء', icon: 'sick', red: false },
  { id: 'abdominal', label: 'ألم في البطن', icon: 'gastroenterology', red: false },
  { id: 'cough', label: 'كحة مستمرة', icon: 'coronavirus', red: false },
  { id: 'fatigue', label: 'تعب وإرهاق', icon: 'battery_alert', red: false },
  { id: 'rash', label: 'طفح جلدي', icon: 'allergy', red: false },
];

const SEVERITIES = [
  { id: 'mild', label: 'خفيف', desc: 'لا يعيق نشاطي' },
  { id: 'moderate', label: 'متوسط', desc: 'يؤثر على نشاطي' },
  { id: 'severe', label: 'شديد', desc: 'لا أستطيع التحمل' },
];

const DURATIONS = [
  { id: 'short', label: 'أقل من ٢٤ ساعة' },
  { id: 'medium', label: '١–٣ أيام' },
  { id: 'long', label: 'أكثر من ٣ أيام' },
];

const EMERGENCY_CONTACTS = [
  { id: 'ambulance', label: 'الإسعاف', display: '١٢٣', number: '123', icon: 'ambulance' },
  { id: 'police', label: 'الشرطة', display: '١٢٢', number: '122', icon: 'local_police' },
  { id: 'fire', label: 'المطافئ', display: '١٨٠', number: '180', icon: 'local_fire_department' },
  { id: 'poison', label: 'مركز السموم', display: '0800 888 0700', number: '08008880700', icon: 'science' },
];

const FIRST_AID = [
  { icon: 'cardiology', text: 'ألم في الصدر: توقف عن المجهود، اجلس مرتاحاً، واتصل بالإسعاف فوراً.' },
  { icon: 'pulmonology', text: 'ضيق التنفس: اجلس منتصباً، وافتح النوافذ، واطلب المساعدة الطبية.' },
  { icon: 'bloodtype', text: 'نزيف: اضغط على الجرح بقماش نظيف وارفع العضو المصاب.' },
  { icon: 'thermostat', text: 'حرارة مرتفعة: خفف الملابس، اشرب سوائل، واستخدم خافض الحرارة حسب التعليمات.' },
  { icon: 'sick', text: 'قيء أو إسهال: عوّض السوائل بمحلول معالجة الجفاف تدريجياً.' },
];

const RESULT_INFO = {
  emergency: {
    title: 'حالة طارئة — اطلب المساعدة فوراً',
    text: 'الأعراض التي اخترتها قد تشير إلى حالة خطيرة تحتاج تدخلاً طبياً عاجلاً.',
    icon: 'emergency',
    advice: [
      'اتصل بالإسعاف ١٢٣ الآن.',
      'لا تقود بنفسك وتجنب أي مجهود.',
      'ابقَ مع المصاب ولا تتركه وحده.',
      'جهّز أدويتك وتقاريرك الطبية إن أمكن.',
    ],
    call: true,
  },
  urgent: {
    title: 'تحتاج تقييماً طبياً قريباً',
    text: 'يُنصح بزيارة الطبيب أو مركز الرعاية خلال ٢٤ ساعة لمتابعة الأعراض.',
    icon: 'schedule',
    advice: [
      'راقب الأعراض وسجّل أي تغير.',
      'خذ قسطاً من الراحة واشرب سوائل كافية.',
      'تجنب الأدوية دون استشارة.',
      'إذا ساءت الحالة اتصل بالطوارئ فوراً.',
    ],
    call: false,
  },
  caution: {
    title: 'أعراض تستدعي الانتباه',
    text: 'يمكنك المتابعة في المنزل مع مراقبة الأعراض، وراجع الطبيب إذا استمرت.',
    icon: 'info',
    advice: [
      'راقب الأعراض لمدة ٢٤–٤٨ ساعة.',
      'حافظ على الراحة والسوائل.',
      'سجّل درجة الحرارة والقياسات.',
      'راجع الطبيب إذا لم تتحسن.',
    ],
    call: false,
  },
  self: {
    title: 'أعراض خفيفة يمكن متابعتها منزلياً',
    text: 'غالباً لا تستدعي القلق، لكن استمر في مراقبة حالتك.',
    icon: 'check_circle',
    advice: [
      'خذ قسطاً من الراحة.',
      'اشرب سوائل كافية.',
      'تغذَّ بشكل متوازن.',
      'راجع الطبيب إذا استمرت الأعراض.',
    ],
    call: false,
  },
};

export default function SymptomCheckerTab() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [severity, setSeverity] = useState('mild');
  const [duration, setDuration] = useState('short');
  const [checked, setChecked] = useState(false);

  const toggleSymptom = (id) => {
    setSelectedIds(prev => (
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    ));
  };

  const reset = () => {
    setSelectedIds([]);
    setSeverity('mild');
    setDuration('short');
    setChecked(false);
  };

  const result = useMemo(() => {
    if (!checked) return null;
    const selected = SYMPTOMS.filter(s => selectedIds.includes(s.id));
    const hasRedFlag = selected.some(s => s.red);

    if (hasRedFlag) return RESULT_INFO.emergency;
    if (severity === 'severe' || duration === 'long' || selected.length >= 3) {
      return RESULT_INFO.urgent;
    }
    if (severity === 'moderate' || selected.length === 2) {
      return RESULT_INFO.caution;
    }
    return RESULT_INFO.self;
  }, [checked, selectedIds, severity, duration]);

  const resultLevel = useMemo(() => {
    if (!result) return '';
    if (result === RESULT_INFO.emergency) return 'emergency';
    if (result === RESULT_INFO.urgent) return 'urgent';
    if (result === RESULT_INFO.caution) return 'caution';
    return 'self';
  }, [result]);

  return (
    <div className="symptoms-page">
      {/* ── Header ───────────────────────────── */}
      <div className="symptoms-header">
        <div>
          <h2 className="symptoms-header__title">
            <span className="material-symbols-outlined">stethoscope</span>
            فحص الأعراض
          </h2>
          <p className="symptoms-header__sub">اختر أعراضك لنعطيك إرشاداً مبدئياً حول مستوى الرعاية المطلوب</p>
        </div>
        <a className="symptoms-call-btn" href="tel:123">
          <span className="material-symbols-outlined">emergency</span>
          اتصال طوارئ ١٢٣
        </a>
      </div>

      <div className="symptoms-grid">
        {/* ── Main ───────────────────────────── */}
        <div className="symptoms-col symptoms-col--main">
          <div className="section-card">
            <div className="section-card__header">
              <div className="section-card__title">
                <span className="material-symbols-outlined">monitor_heart</span>
                ما الذي تشعر به؟
              </div>
              <span className="section-card__badge">{selectedIds.length} محدد</span>
            </div>

            <div className="symptoms-section">
              <div className="symptoms-section__title">اختر الأعراض</div>
              <div className="symptoms-chips">
                {SYMPTOMS.map(symptom => {
                  const active = selectedIds.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      className={`symptom-chip ${active ? 'active' : ''} ${symptom.red ? 'symptom-chip--red' : ''}`}
                      onClick={() => toggleSymptom(symptom.id)}
                    >
                      <span className="symptom-chip__icon material-symbols-outlined">{symptom.icon}</span>
                      <span className="symptom-chip__label">{symptom.label}</span>
                      {active && <span className="symptom-chip__check material-symbols-outlined">check</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="symptoms-section">
              <div className="symptoms-section__title">ما شدة الأعراض؟</div>
              <div className="symptoms-segments">
                {SEVERITIES.map(item => (
                  <button
                    key={item.id}
                    className={`symptoms-segment ${severity === item.id ? 'active' : ''}`}
                    onClick={() => setSeverity(item.id)}
                  >
                    <span className="symptoms-segment__label">{item.label}</span>
                    <span className="symptoms-segment__desc">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="symptoms-section">
              <div className="symptoms-section__title">منذ متى بدأت الأعراض؟</div>
              <div className="symptoms-segments symptoms-segments--duration">
                {DURATIONS.map(item => (
                  <button
                    key={item.id}
                    className={`symptoms-segment ${duration === item.id ? 'active' : ''}`}
                    onClick={() => setDuration(item.id)}
                  >
                    <span className="symptoms-segment__label">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="symptoms-actions">
              <button
                className="btn-primary"
                onClick={() => setChecked(true)}
                disabled={selectedIds.length === 0}
              >
                <span className="material-symbols-outlined">monitor_heart</span>
                افحص الأعراض
              </button>
              <button className="symptoms-reset" onClick={reset}>
                <span className="material-symbols-outlined">restart_alt</span>
                إعادة تعيين
              </button>
            </div>

            {selectedIds.length === 0 && (
              <p className="symptoms-hint">
                <span className="material-symbols-outlined">info</span>
                اختر عرضاً واحداً على الأقل لبدء الفحص.
              </p>
            )}
          </div>

          {checked && result && (
            <div className={`symptoms-result symptoms-result--${resultLevel}`}>
              <div className="symptoms-result__icon">
                <span className="material-symbols-outlined">{result.icon}</span>
              </div>
              <div className="symptoms-result__body">
                <h3>{result.title}</h3>
                <p className="symptoms-result__text">{result.text}</p>
                <ul className="symptoms-result__advice">
                  {result.advice.map(item => (
                    <li key={item}>
                      <span className="material-symbols-outlined">arrow_left</span>
                      {item}
                    </li>
                  ))}
                </ul>
                {result.call && (
                  <a className="symptoms-result__call" href="tel:123">
                    <span className="material-symbols-outlined">call</span>
                    اتصل بالإسعاف الآن — ١٢٣
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Side ───────────────────────────── */}
        <div className="symptoms-col symptoms-col--side">
          <div className="emergency-card">
            <div className="emergency-card__head">
              <span className="material-symbols-outlined">emergency</span>
              <div>
                <h3>اتصال طوارئ</h3>
                <p>اطلب المساعدة فوراً عند الخطر</p>
              </div>
            </div>

            <a className="emergency-card__call" href="tel:123">
              <span className="material-symbols-outlined">call</span>
              اتصل بالإسعاف ١٢٣
            </a>

            <div className="emergency-contacts">
              {EMERGENCY_CONTACTS.map(contact => (
                <a key={contact.id} className="emergency-contact" href={`tel:${contact.number}`}>
                  <span className="emergency-contact__icon material-symbols-outlined">{contact.icon}</span>
                  <div className="emergency-contact__info">
                    <span className="emergency-contact__label">{contact.label}</span>
                    <span className="emergency-contact__num">{contact.display}</span>
                  </div>
                  <span className="emergency-contact__call material-symbols-outlined">call</span>
                </a>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-card__header">
              <div className="section-card__title">
                <span className="material-symbols-outlined">health_and_safety</span>
                إسعافات أولية سريعة
              </div>
            </div>
            <ul className="first-aid">
              {FIRST_AID.map(item => (
                <li key={item.text}>
                  <span className="first-aid__icon material-symbols-outlined">{item.icon}</span>
                  <p>{item.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="symptoms-disclaimer">
            <span className="material-symbols-outlined">gpp_maybe</span>
            <p>هذا الفحص إرشادي فقط ولا يغني عن استشارة الطبيب أو تشخيصه.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
