import React, { useState, useEffect } from 'react';

/* ─────────────────────────────────────────
   STYLES
───────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --blue:       #1B6FE8;
  --blue-dark:  #1558C0;
  --blue-light: #EBF2FF;
  --green:      #22C55E;
  --green-bg:   #F0FDF4;
  --green-dark: #16A34A;
  --red:        #EF4444;
  --red-bg:     #FEF2F2;
  --text:       #0F172A;
  --text2:      #475569;
  --text3:      #94A3B8;
  --border:     #E2E8F0;
  --bg:         #F8FAFC;
  --bg2:        #FFFFFF;
  --radius-sm:  10px;
  --shadow-lg:  0 8px 40px rgba(0,0,0,.13);
}

.fp-page {
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  min-height: 100vh;
  background: linear-gradient(135deg, #EBF2FF 0%, #F5F3FF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

/* ── PHONE SHELL ── */
.fp-phone {
  width: 360px;
  background: var(--bg2);
  border-radius: 28px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--border);
}

.fp-phone-header {
  padding: 14px 20px 12px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg2);
}

.fp-logo {
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -.4px;
}

.fp-back-btn {
  width: 28px; height: 28px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  color: var(--text2);
  transition: background .15s;
}
.fp-back-btn:hover { background: var(--border); }
.fp-back-btn.hidden { visibility: hidden; pointer-events: none; }

.fp-info-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--text3);
  display: flex; align-items: center; justify-content: center;
  color: var(--text3);
  font-size: 12px; font-weight: 700;
}

/* ── STEP INDICATOR ── */
.fp-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px 0;
  gap: 0;
}
.fp-step-dot {
  width: 30px; height: 30px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
  transition: all .3s;
  flex-shrink: 0;
}
.fp-step-dot.done { background: var(--green); color: #fff; }
.fp-step-dot.active { background: var(--blue); color: #fff; box-shadow: 0 0 0 4px #BFDBFE; }
.fp-step-dot.idle { background: var(--bg); color: var(--text3); border: 1.5px solid var(--border); }
.fp-step-line {
  flex: 1; height: 2px; background: var(--border);
  transition: background .3s;
  max-width: 60px;
}
.fp-step-line.done { background: var(--green); }

/* ── BODY ── */
.fp-body {
  padding: 24px 28px 32px;
}

/* ── SLIDE ANIMATION ── */
.fp-slide-enter { animation: slideIn .3s ease forwards; }
.fp-slide-exit  { animation: slideOut .2s ease forwards; }
@keyframes slideIn  { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
@keyframes slideOut { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(20px); } }

/* ── ICON CIRCLE ── */
.fp-icon-circle {
  width: 68px; height: 68px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}
.fp-icon-circle svg { width: 30px; height: 30px; }
.fp-icon-blue  { background: var(--blue-light); }
.fp-icon-green { background: var(--green-bg); box-shadow: 0 0 0 8px #DCFCE7; }

/* ── TEXT ── */
.fp-title {
  font-size: 20px; font-weight: 800;
  color: var(--text);
  text-align: center;
  margin-bottom: 8px;
}
.fp-title-en {
  font-size: 22px; font-weight: 800;
  color: var(--text);
  margin-bottom: 6px;
}
.fp-sub {
  font-size: 13px; color: var(--text2);
  text-align: center;
  line-height: 1.65;
  margin-bottom: 24px;
}
.fp-sub-en {
  font-size: 12px; color: var(--text2);
  line-height: 1.65;
  margin-bottom: 20px;
}

/* ── INPUTS ── */
.fp-field { margin-bottom: 14px; }
.fp-field label {
  display: block;
  font-size: 11px; font-weight: 700;
  color: var(--text2);
  margin-bottom: 7px;
  letter-spacing: .03em;
}
.fp-input-wrap { position: relative; }
.fp-input {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: 'Cairo', sans-serif;
  color: var(--text);
  background: var(--bg);
  outline: none;
  direction: ltr;
  text-align: left;
  transition: border .15s, box-shadow .15s;
}
.fp-input:focus {
  border-color: var(--blue);
  background: #fff;
  box-shadow: 0 0 0 3px #BFDBFE55;
}
.fp-input.err { border-color: var(--red); }
.fp-input-icon {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  color: var(--text3);
  display: flex;
}
.fp-eye {
  position: absolute;
  left: 12px; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  cursor: pointer; color: var(--text3);
  padding: 0; display: flex;
}
.fp-eye:hover { color: var(--text2); }
.fp-input-has-icon { padding-left: 36px; }

/* ── CHIP (email display) ── */
.fp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--blue-light);
  color: var(--blue);
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 18px;
}
.fp-chip-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

/* ── ERROR ── */
.fp-err-msg {
  color: var(--red);
  font-size: 11px;
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ── STRENGTH ── */
.fp-strength-track {
  height: 4px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0 5px;
}
.fp-strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width .3s, background .3s;
}
.fp-strength-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.fp-strength-lbl { font-size: 11px; font-weight: 600; }

/* ── CHECKLIST ── */
.fp-checklist {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.fp-check-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text3);
  transition: color .2s;
}
.fp-check-item.ok { color: var(--green-dark); }
.fp-check-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px;
  flex-shrink: 0;
  transition: all .2s;
}
.fp-check-item.ok .fp-check-dot {
  background: var(--green); border-color: var(--green); color: #fff;
}

/* ── BUTTONS ── */
.fp-btn {
  width: 100%;
  padding: 13px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: 15px; font-weight: 700;
  font-family: 'Cairo', sans-serif;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all .15s;
  margin-top: 6px;
}
.fp-btn-primary { background: var(--blue); color: #fff; }
.fp-btn-primary:hover { background: var(--blue-dark); transform: translateY(-1px); }
.fp-btn-primary:active { transform: translateY(0); }
.fp-btn-green { background: var(--green); color: #fff; }
.fp-btn-green:hover { background: var(--green-dark); transform: translateY(-1px); }
.fp-btn-outline {
  background: transparent;
  color: var(--blue);
  border: 1.5px solid var(--blue);
  font-size: 14px; font-weight: 600;
  font-family: 'Cairo', sans-serif;
  cursor: pointer;
  width: 100%; padding: 11px;
  border-radius: var(--radius-sm);
  margin-top: 10px;
  transition: all .15s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.fp-btn-outline:hover { background: var(--blue-light); }

/* ── BACK LINK ── */
.fp-back-link {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text2);
}
.fp-back-link a {
  color: var(--blue); cursor: pointer;
  font-weight: 600; text-decoration: none;
}
.fp-back-link a:hover { text-decoration: underline; }

/* ── SECURITY ── */
.fp-security {
  display: flex; align-items: center; justify-content: center;
  gap: 5px; margin-top: 14px;
  font-size: 11px; color: var(--text3);
}

/* ── SUCCESS LIST ── */
.fp-success-list {
  display: flex; flex-direction: column; gap: 10px;
  margin: 6px 0 22px;
}
.fp-success-item {
  display: flex; align-items: center; gap: 10px;
  background: var(--green-bg);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 13px; font-weight: 600;
  color: var(--green-dark);
}
.fp-success-item svg { flex-shrink: 0; }

/* ── EMAIL ILLUSTRATION ── */
.fp-illustration {
  display: flex; justify-content: center;
  margin: 20px 0 8px;
}
`;

/* ── ICONS ── */
const IKey = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="#1B6FE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7.5" cy="15.5" r="5.5" />
        <path d="m21 2-9.6 9.6M15.5 7.5l2 2M13 10l2 2" />
    </svg>
);
const ICheck = ({ color = 'white', size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
    </svg>
);
const IMail = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);
const IShield = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IArrow = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);
const IEye = ({ off }) => off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

/* ── STRENGTH ── */
function getStrength(v) {
    if (!v) return { score: 0, label: '', color: '', w: '0%', pct: 0 };
    let s = 0;
    if (v.length >= 6) s++;
    if (v.length >= 10) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    const map = [
        { label: 'ضعيفة', color: '#EF4444', w: '20%' },
        { label: 'مقبولة', color: '#F59E0B', w: '45%' },
        { label: 'جيدة', color: '#3B82F6', w: '70%' },
        { label: 'قوية', color: '#22C55E', w: '100%' },
    ];
    const idx = Math.min(s - 1, 3);
    return { score: s, ...(idx >= 0 ? map[idx] : { label: '', color: '', w: '0%' }), pct: Math.round((s / 4) * 100) };
}

/* ── MOCK USER DB (same as signup) ── */
function getUsers() {
    try { return JSON.parse(localStorage.getItem('doseme-users') || '{}'); } catch { return {}; }
}
function updatePassword(email, newPass) {
    try {
        const users = getUsers();
        if (users[email]) {
            users[email].pass = newPass;
            localStorage.setItem('doseme-users', JSON.stringify(users));
            return true;
        }
        return false;
    } catch { return false; }
}

/* ═══════════════════════════════════════
   STEP 1 — إدخال الإيميل
═══════════════════════════════════════ */
function Step1({ onNext, onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [err, setErr] = useState('');

    const handleSend = () => {
        const v = email.trim();
        if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
            setErr('يُرجى إدخال بريد إلكتروني صحيح'); return;
        }
        const users = getUsers();
        if (!users[v]) {
            setErr('هذا البريد غير مسجل في النظام'); return;
        }
        setErr('');
        onNext(v);
    };

    return (
        <div className="fp-slide-enter">
            {/* Icon */}
            <div className="fp-icon-circle fp-icon-blue">
                <IKey />
            </div>

            <div className="fp-title">نسيت كلمة المرور؟</div>
            <div className="fp-sub">
                أدخل بريدك الإلكتروني المسجل وسنتأكد من وجوده ثم نتيح لك تعيين كلمة مرور جديدة
            </div>

            <div className="fp-field">
                <label>البريد الإلكتروني</label>
                <div className="fp-input-wrap">
                    <input
                        className={`fp-input fp-input-has-icon${err ? ' err' : ''}`}
                        type="email"
                        placeholder="example@doseme.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setErr(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <div className="fp-input-icon"><IMail size={16} /></div>
                </div>
                {err && <div className="fp-err-msg">⚠ {err}</div>}
            </div>

            <button className="fp-btn fp-btn-primary" onClick={handleSend}>
                <IMail size={17} /> إرسال رابط الاستعادة
            </button>

            <div className="fp-back-link">
                <a onClick={onBackToLogin}>← العودة لتسجيل الدخول</a>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   STEP 2 — تعيين كلمة مرور جديدة
═══════════════════════════════════════ */
function Step2({ email, onNext, onChangeEmail }) {
    const [pass, setPass] = useState('');
    const [pass2, setPass2] = useState('');
    const [showP, setShowP] = useState(false);
    const [showP2, setShowP2] = useState(false);
    const [err, setErr] = useState('');
    const str = getStrength(pass);
    const checks = [
        { id: 'len', ok: pass.length >= 6, label: '٦+ أحرف' },
        { id: 'case', ok: /[A-Z]/.test(pass) && /[a-z]/.test(pass), label: 'Upper & lowercase' },
        { id: 'num', ok: /[0-9]/.test(pass), label: 'رقم واحد على الأقل' },
    ];

    const handleSave = () => {
        if (pass.length < 6) { setErr('كلمة المرور يجب أن تكون ٦ أحرف على الأقل'); return; }
        if (pass !== pass2) { setErr('كلمتا المرور غير متطابقتان'); return; }
        updatePassword(email, pass);
        setErr('');
        onNext();
    };

    return (
        <div className="fp-slide-enter">
            <div className="fp-title-en">Secure your account</div>
            <div className="fp-sub-en">
                Create a new password that is strong and unique to ensure your health data stays private.
            </div>

            {/* Email chip + change button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, background: 'var(--bg)', borderRadius: 10, padding: '8px 12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>
                    <IMail size={14} /> {email}
                </div>
                {/* ✅ زر تغيير الإيميل */}
                <button
                    onClick={onChangeEmail}
                    style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                >
                    <IArrow /> تغيير
                </button>
            </div>

            <div className="fp-field">
                <label>NEW PASSWORD</label>
                <div className="fp-input-wrap">
                    <input
                        className="fp-input fp-input-has-icon"
                        type={showP ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={pass}
                        onChange={e => { setPass(e.target.value); setErr(''); }}
                    />
                    <button className="fp-eye" onClick={() => setShowP(p => !p)}>
                        <IEye off={showP} />
                    </button>
                </div>

                {/* Strength */}
                <div className="fp-strength-track">
                    <div className="fp-strength-fill" style={{ width: str.w || '0%', background: str.color }} />
                </div>
                <div className="fp-strength-row">
                    <span className="fp-strength-lbl" style={{ color: str.color }}>{str.label}</span>
                    {str.score > 0 && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{str.pct}%</span>}
                </div>

                {/* Checklist */}
                <div className="fp-checklist">
                    {checks.map(c => (
                        <div key={c.id} className={`fp-check-item${c.ok ? ' ok' : ''}`}>
                            <div className="fp-check-dot">{c.ok ? '✓' : ''}</div>
                            {c.label}
                        </div>
                    ))}
                </div>
            </div>

            <div className="fp-field">
                <label>CONFIRM NEW PASSWORD</label>
                <div className="fp-input-wrap">
                    <input
                        className="fp-input fp-input-has-icon"
                        type={showP2 ? 'text' : 'password'}
                        placeholder="Repeat new password"
                        value={pass2}
                        onChange={e => { setPass2(e.target.value); setErr(''); }}
                        style={{ borderColor: pass2 && pass !== pass2 ? 'var(--red)' : '' }}
                    />
                    <button className="fp-eye" onClick={() => setShowP2(p => !p)}>
                        <IEye off={showP2} />
                    </button>
                </div>
            </div>

            {err && <div className="fp-err-msg" style={{ marginBottom: 8 }}>⚠ {err}</div>}

            <button className="fp-btn fp-btn-primary" onClick={handleSave}>
                Save New Password →
            </button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
                Need help? <span style={{ color: 'var(--blue)', cursor: 'pointer' }}>Contact Clinical Support</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   STEP 3 — تم تحديث كلمة المرور
═══════════════════════════════════════ */
function Step3({ onBackToLogin }) {
    return (
        <div className="fp-slide-enter">
            {/* Big green check */}
            <div className="fp-icon-circle fp-icon-green" style={{ width: 80, height: 80, marginBottom: 24 }}>
                <ICheck color="#22C55E" size={36} />
            </div>

            <div className="fp-title">تم تغيير كلمة المرور بنجاح</div>
            <div className="fp-sub">
                لقد تم تحديث بيانات حسابك بنجاح. يمكنك الآن استخدام كلمة المرور الجديدة للدخول إلى{' '}
                <strong>DoseMe</strong>
            </div>

            <div className="fp-success-list">
                <div className="fp-success-item">
                    <ICheck color="#16A34A" size={16} />
                    تم تحديث كلمة المرور بنجاح
                </div>
                <div className="fp-success-item">
                    <IShield size={16} />
                    حسابك محمي الآن
                </div>
                <div className="fp-success-item">
                    <IMail size={16} />
                    جميع الأجهزة تم تسجيل خروجها
                </div>
            </div>

            <button className="fp-btn fp-btn-primary" onClick={onBackToLogin}>
                <IMail size={17} /> Login Now
            </button>

            <div className="fp-security">
                <IShield size={13} /> SECURITY VERIFIED
            </div>

            {/* Email illustration */}
            <div className="fp-illustration">
                <svg viewBox="0 0 160 90" width="140" fill="none">
                    <rect x="10" y="10" width="140" height="70" rx="10" fill="#EBF2FF" stroke="#1B6FE8" strokeWidth="1.5" />
                    <path d="M10 22 80 58 150 22" stroke="#1B6FE8" strokeWidth="1.5" />
                    <circle cx="128" cy="22" r="16" fill="#22C55E" />
                    <path d="M121 22l5 5 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <div className="fp-back-link">
                <a onClick={onBackToLogin}>← العودة لتسجيل الدخول</a>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════
   STEP DOTS COMPONENT
═══════════════════════════════════════ */
function StepDots({ step }) {
    const dots = [1, 2, 3];
    return (
        <div className="fp-steps">
            {dots.map((d, i) => (
                <React.Fragment key={d}>
                    <div className={`fp-step-dot ${step > d ? 'done' : step === d ? 'active' : 'idle'}`}>
                        {step > d
                            ? <ICheck size={13} />
                            : <span style={{ fontFamily: 'Cairo, sans-serif' }}>
                                {['١', '٢', '٣'][i]}
                            </span>
                        }
                    </div>
                    {i < dots.length - 1 && (
                        <div className={`fp-step-line${step > d ? ' done' : ''}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════
   ROOT — ForgotPasswordFlow
   Props:
     onBackToLogin {function}
═══════════════════════════════════════ */
export default function ForgotPasswordFlow({ onBackToLogin }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');

    const goNext = (mail) => { if (mail) setEmail(mail); setStep(s => s + 1); };
    const goBack = () => setStep(s => s - 1);

    /* header right side */
    const showBack = step === 1;
    const showInfo = step === 2;
    const showArrow3 = step === 3;

    return (
        <>
            <style>{css}</style>
            <div className="fp-page">
                <div className="fp-phone">

                    {/* Header */}
                    <div className="fp-phone-header">
                        <div className="fp-logo">DoseMe</div>
                        {showBack && <div className="fp-back-btn" onClick={onBackToLogin}><IArrow /></div>}
                        {showInfo && <div className="fp-info-btn">i</div>}
                        {showArrow3 && <div className="fp-back-btn" onClick={onBackToLogin}><IArrow /></div>}
                    </div>

                    {/* Step dots */}
                    {step < 3 && <StepDots step={step} />}

                    {/* Body */}
                    <div className="fp-body">
                        {step === 1 && (
                            <Step1
                                onNext={goNext}
                                onBackToLogin={onBackToLogin}
                            />
                        )}
                        {step === 2 && (
                            <Step2
                                email={email}
                                onNext={() => setStep(3)}
                                onChangeEmail={goBack}   /* ✅ يرجع لـ step 1 لتغيير الإيميل */
                            />
                        )}
                        {step === 3 && (
                            <Step3
                                onBackToLogin={onBackToLogin}
                            />
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}