// src/components/IndicatorsTab.jsx
import React, { useEffect, useMemo, useState } from 'react';
import './IndicatorsTab.css';

const STORAGE_PREFIX = 'doseme-vitals:';

const METRICS = [
  { key: 'heart',    label: 'نبض القلب', icon: 'cardiology',      unit: 'bpm',   color: '#ef4444' },
  { key: 'bp',       label: 'ضغط الدم', icon: 'vital_signs',     unit: 'mmHg',  color: '#0066ff' },
  { key: 'sugar',    label: 'سكر الدم', icon: 'glucose',         unit: 'mg/dL', color: '#f59e0b' },
  { key: 'weight',   label: 'الوزن',    icon: 'monitor_weight',  unit: 'كجم',   color: '#10b981' },
];

const SAMPLE_READINGS = [
  { id: 1, date: '2024-01-20T08:30', systolic: 120, diastolic: 80, hr: 72, weight: 75,   sugar: 110, temp: 36.8, oxygen: 98 },
  { id: 2, date: '2024-01-19T08:15', systolic: 125, diastolic: 82, hr: 75, weight: 75.5, sugar: 145, temp: 36.9, oxygen: 97 },
  { id: 3, date: '2024-01-18T21:00', systolic: 118, diastolic: 78, hr: 70, weight: 76,   sugar: 108, temp: 36.7, oxygen: 99 },
  { id: 4, date: '2024-01-17T08:20', systolic: 132, diastolic: 86, hr: 78, weight: 75.8, sugar: 152, temp: 37.0, oxygen: 96 },
  { id: 5, date: '2024-01-16T08:10', systolic: 122, diastolic: 79, hr: 71, weight: 75.2, sugar: 112, temp: 36.6, oxygen: 98 },
];

function nowLocal() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function emptyForm() {
  return {
    date: nowLocal(),
    systolic: '', diastolic: '', hr: '',
    weight: '', sugar: '', temp: '', oxygen: '',
  };
}

function toNum(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function bpStatus(sys, dia) {
  if (sys == null && dia == null) return 'none';
  if ((sys != null && sys >= 140) || (dia != null && dia >= 90)) return 'warning';
  if ((sys != null && sys >= 130) || (dia != null && dia >= 80)) return 'caution';
  return 'normal';
}
function hrStatus(hr) {
  if (hr == null) return 'none';
  if (hr < 60 || hr > 100) return 'warning';
  if (hr > 90) return 'caution';
  return 'normal';
}
function sugarStatus(sugar) {
  if (sugar == null) return 'none';
  if (sugar >= 180) return 'warning';
  if (sugar >= 140) return 'caution';
  return 'normal';
}
function weightStatus() { return 'normal'; }
function tempStatus(temp) {
  if (temp == null) return 'none';
  if (temp >= 37.5 || temp < 35) return 'warning';
  if (temp >= 37.2) return 'caution';
  return 'normal';
}
function oxygenStatus(oxygen) {
  if (oxygen == null) return 'none';
  if (oxygen < 90) return 'warning';
  if (oxygen < 95) return 'caution';
  return 'normal';
}

const STATUS_LABEL = { normal: 'طبيعي', caution: 'انتباه', warning: 'مرتفع', none: '—' };

function StatusBadge({ status }) {
  if (!status || status === 'none') return null;
  return <span className={`vitals-badge vitals-badge--${status}`}>{STATUS_LABEL[status]}</span>;
}

function getLatestWith(readings, field) {
  for (const r of readings) {
    if (field === 'bp') {
      if (r.systolic != null || r.diastolic != null) return r;
    } else if (r[field] != null) {
      return r;
    }
  }
  return null;
}

function metricValue(r, key) {
  if (!r) return { display: '—', status: 'none' };
  switch (key) {
    case 'bp': {
      const sys = r.systolic, dia = r.diastolic;
      const display = sys != null && dia != null ? `${sys}/${dia}` : (sys ?? dia ?? '—');
      return { display, status: bpStatus(sys, dia) };
    }
    case 'heart':
      return { display: r.hr ?? '—', status: hrStatus(r.hr) };
    case 'sugar':
      return { display: r.sugar ?? '—', status: sugarStatus(r.sugar) };
    case 'weight':
      return { display: r.weight ?? '—', status: weightStatus() };
    default:
      return { display: '—', status: 'none' };
  }
}

function metricNumber(r, key) {
  if (!r) return null;
  if (key === 'bp') return r.systolic;
  if (key === 'heart') return r.hr;
  return r[key];
}

function TrendChart({ readings, metricKey }) {
  const metric = METRICS.find(m => m.key === metricKey) || METRICS[0];
  const points = useMemo(() => {
    const values = readings
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(r => ({ date: r.date, val: metricNumber(r, metric.key) }))
      .filter(p => p.val != null)
      .slice(-8);
    return values;
  }, [readings, metric.key]);

  if (points.length < 2) {
    return <p className="vitals-chart__empty">أضف قراءتين على الأقل لعرض الرسم البياني.</p>;
  }

  const W = 560, H = 140, PAD = 10;
  const max = Math.max(...points.map(p => p.val));
  const min = Math.min(...points.map(p => p.val));
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = PAD + (i / (points.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((p.val - min) / range) * (H - PAD * 2);
    return { ...p, x, y };
  });
  const line = coords.map(c => `${c.x},${c.y}`).join(' ');
  const area = `${PAD},${H - PAD} ${line} ${W - PAD},${H - PAD}`;

  return (
    <div className="vitals-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="vitals-chart__svg" preserveAspectRatio="none">
        <polygon points={area} fill={metric.color} opacity="0.08" />
        <polyline points={line} fill="none" stroke={metric.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="4" fill={metric.color} />
        ))}
      </svg>
      <div className="vitals-chart__labels">
        {coords.map((c, i) => (
          <span key={i}>{c.val}</span>
        ))}
      </div>
    </div>
  );
}

export default function IndicatorsTab({ userEmail = '' }) {
  const storageKey = `${STORAGE_PREFIX}${userEmail || 'guest'}`;

  const [readings, setReadings] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return SAMPLE_READINGS;
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [chartMetric, setChartMetric] = useState('heart');

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(readings)); } catch {}
  }, [readings, storageKey]);

  const sorted = useMemo(
    () => readings.slice().sort((a, b) => new Date(b.date) - new Date(a.date)),
    [readings]
  );

  const summary = useMemo(() => (
    METRICS.map(metric => {
      const latest = getLatestWith(sorted, metric.key);
      const value = metricValue(latest, metric.key);
      return { ...metric, ...value, at: latest?.date };
    })
  ), [sorted]);

  const setField = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    if (error) setError('');
  };

  const handleSave = () => {
    const next = {
      id: Date.now(),
      date: form.date || nowLocal(),
      systolic: toNum(form.systolic),
      diastolic: toNum(form.diastolic),
      hr: toNum(form.hr),
      weight: toNum(form.weight),
      sugar: toNum(form.sugar),
      temp: toNum(form.temp),
      oxygen: toNum(form.oxygen),
    };

    const hasAny = ['systolic', 'diastolic', 'hr', 'weight', 'sugar', 'temp', 'oxygen']
      .some(k => next[k] != null);

    if (!hasAny) {
      setError('سجّل قيمة واحدة على الأقل.');
      return;
    }

    setReadings(prev => [next, ...prev]);
    setForm(emptyForm());
    setShowForm(false);
    setError('');
  };

  const handleDelete = (id) => {
    setReadings(prev => prev.filter(r => r.id !== id));
  };

  const handleCancel = () => {
    setForm(emptyForm());
    setShowForm(false);
    setError('');
  };

  return (
    <div className="vitals-page">
      <div className="vitals-page__header">
        <div>
          <h2 className="vitals-page__title">
            <span className="material-symbols-outlined">vital_signs</span>
            المؤشرات الحيوية
          </h2>
          <p className="vitals-page__sub">سجّل قراءاتك وتابع تطورها بمرور الوقت</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setShowForm(v => !v); setError(''); }}
        >
          <span className="material-symbols-outlined">{showForm ? 'close' : 'add_circle'}</span>
          {showForm ? 'إغلاق' : 'تسجيل قراءة جديدة'}
        </button>
      </div>

      {/* ── Summary ─────────────────────────── */}
      <div className="vitals-summary">
        {summary.map(item => (
          <div key={item.key} className={`vitals-summary__card vitals-summary__card--${item.status}`}>
            <div className={`vitals-summary__icon vitals-summary__icon--${item.status}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div className="vitals-summary__body">
              <p className="vitals-summary__label">{item.label}</p>
              <div className="vitals-summary__value-row">
                <span className="vitals-summary__value">{item.display}</span>
                <span className="vitals-summary__unit">{item.unit}</span>
              </div>
              <div className="vitals-summary__meta">
                <StatusBadge status={item.status} />
                {item.at && <span className="vitals-summary__time">{formatDate(item.at)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add form ────────────────────────── */}
      {showForm && (
        <div className="vitals-form section-card">
          <div className="section-card__header">
            <div className="section-card__title">
              <span className="material-symbols-outlined">edit_note</span>
              قراءة جديدة
            </div>
          </div>

          <div className="vitals-form__grid">
            <label className="vitals-field vitals-field--wide">
              <span>التاريخ والوقت</span>
              <input type="datetime-local" value={form.date} onChange={setField('date')} />
            </label>

            <label className="vitals-field">
              <span>الضغط الانقباضي (Systolic)</span>
              <input type="number" inputMode="numeric" placeholder="120" value={form.systolic} onChange={setField('systolic')} />
            </label>
            <label className="vitals-field">
              <span>الضغط الانبساطي (Diastolic)</span>
              <input type="number" inputMode="numeric" placeholder="80" value={form.diastolic} onChange={setField('diastolic')} />
            </label>

            <label className="vitals-field">
              <span>نبض القلب (bpm)</span>
              <input type="number" inputMode="numeric" placeholder="72" value={form.hr} onChange={setField('hr')} />
            </label>
            <label className="vitals-field">
              <span>الوزن (كجم)</span>
              <input type="number" inputMode="decimal" placeholder="75" value={form.weight} onChange={setField('weight')} />
            </label>

            <label className="vitals-field">
              <span>سكر الدم (mg/dL)</span>
              <input type="number" inputMode="numeric" placeholder="110" value={form.sugar} onChange={setField('sugar')} />
            </label>
            <label className="vitals-field">
              <span>درجة الحرارة (°C)</span>
              <input type="number" inputMode="decimal" placeholder="36.8" value={form.temp} onChange={setField('temp')} />
            </label>

            <label className="vitals-field">
              <span>الأكسجين (SpO₂ %)</span>
              <input type="number" inputMode="numeric" placeholder="98" value={form.oxygen} onChange={setField('oxygen')} />
            </label>
          </div>

          {error && (
            <p className="vitals-form__error">
              <span className="material-symbols-outlined">error</span>
              {error}
            </p>
          )}

          <div className="vitals-form__actions">
            <button className="vitals-btn vitals-btn--save" onClick={handleSave}>
              <span className="material-symbols-outlined">save</span>
              حفظ القراءة
            </button>
            <button className="vitals-btn vitals-btn--cancel" onClick={handleCancel}>إلغاء</button>
          </div>
        </div>
      )}

      {/* ── Trend chart ─────────────────────── */}
      <div className="section-card vitals-chart-card">
        <div className="section-card__header">
          <div className="section-card__title">
            <span className="material-symbols-outlined">show_chart</span>
            اتجاه القراءات
          </div>
          <div className="vitals-chart__tabs">
            {METRICS.map(m => (
              <button
                key={m.key}
                className={`vitals-chart__tab ${chartMetric === m.key ? 'active' : ''}`}
                onClick={() => setChartMetric(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <TrendChart readings={readings} metricKey={chartMetric} />
      </div>

      {/* ── History table ───────────────────── */}
      <div className="section-card">
        <div className="section-card__header">
          <div className="section-card__title">
            <span className="material-symbols-outlined">history</span>
            سجل القراءات
          </div>
          <span className="section-card__badge">{readings.length} قراءة</span>
        </div>

        {readings.length === 0 ? (
          <div className="vitals-empty">
            <span className="material-symbols-outlined">monitor_heart</span>
            <p>لا توجد قراءات بعد. ابدأ بتسجيل أول قراءة.</p>
          </div>
        ) : (
          <div className="vitals-table-wrapper">
            <table className="vitals-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>ضغط الدم</th>
                  <th>النبض</th>
                  <th>الوزن</th>
                  <th>السكر</th>
                  <th>الحرارة</th>
                  <th>الأكسجين</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => {
                  const bp = bpStatus(r.systolic, r.diastolic);
                  const hr = hrStatus(r.hr);
                  const sugar = sugarStatus(r.sugar);
                  const temp = tempStatus(r.temp);
                  const oxygen = oxygenStatus(r.oxygen);
                  const bpDisplay = r.systolic != null && r.diastolic != null
                    ? `${r.systolic}/${r.diastolic}`
                    : (r.systolic ?? r.diastolic ?? '—');
                  return (
                    <tr key={r.id}>
                      <td className="vitals-table__date">{formatDate(r.date)}</td>
                      <td className={`vitals-table__cell vitals-table__cell--${bp}`}>
                        {bpDisplay}
                        <StatusBadge status={bp} />
                      </td>
                      <td className={`vitals-table__cell vitals-table__cell--${hr}`}>
                        {r.hr ?? '—'}
                        <StatusBadge status={hr} />
                      </td>
                      <td className="vitals-table__cell">{r.weight ?? '—'}</td>
                      <td className={`vitals-table__cell vitals-table__cell--${sugar}`}>
                        {r.sugar ?? '—'}
                        <StatusBadge status={sugar} />
                      </td>
                      <td className={`vitals-table__cell vitals-table__cell--${temp}`}>
                        {r.temp ?? '—'}
                        <StatusBadge status={temp} />
                      </td>
                      <td className={`vitals-table__cell vitals-table__cell--${oxygen}`}>
                        {r.oxygen ?? '—'}
                        <StatusBadge status={oxygen} />
                      </td>
                      <td>
                        <button
                          className="vitals-delete"
                          onClick={() => handleDelete(r.id)}
                          aria-label="حذف القراءة"
                          title="حذف"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
