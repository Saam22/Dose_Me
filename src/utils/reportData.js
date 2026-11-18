// src/utils/reportData.js
export const VITALS_PREFIX = 'doseme-vitals:';
export const RECOVERY_PREFIX = 'doseme-recovery:';
export const USERS_KEY = 'doseme-users';
export const RECOVERY_PLAN_DAYS = 84;

export const RECOVERY_PHASE_TITLES = [
  'التقييم والتشخيص',
  'الالتزام بالعلاج',
  'استعادة النشاط',
  'الوقاية والمتابعة',
];

const PHASE_THRESHOLDS = [0, 25, 60, 85];

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeKey(value) {
  return (value || '').toString().trim().toLowerCase();
}

export function loadUserProfile(email) {
  const users = readJSON(USERS_KEY);
  if (!users || typeof users !== 'object') return null;
  const key = normalizeKey(email);
  const match = Object.keys(users).find((k) => normalizeKey(k) === key);
  return match ? users[match] : null;
}

export function loadVitals(email) {
  const parsed = readJSON(`${VITALS_PREFIX}${email || 'guest'}`);
  return Array.isArray(parsed) ? parsed : [];
}

export function loadRecovery(email) {
  const parsed = readJSON(`${RECOVERY_PREFIX}${email || 'guest'}`);
  if (!parsed) return null;
  if (Array.isArray(parsed)) return { tasks: parsed, startDate: null };
  if (Array.isArray(parsed.tasks)) {
    return { tasks: parsed.tasks, startDate: parsed.startDate || null };
  }
  return null;
}

function toDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(value) {
  const d = toDate(value);
  if (!d) return '—';
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatReportDate(date = new Date()) {
  try {
    return date.toLocaleString('ar-EG', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return formatDateTime(date);
  }
}

export function average(values) {
  const nums = values.filter((v) => Number.isFinite(v));
  if (!nums.length) return null;
  const total = nums.reduce((sum, v) => sum + v, 0);
  return Math.round((total / nums.length) * 10) / 10;
}

export function bpStatus(sys, dia) {
  if (sys == null && dia == null) return 'none';
  if ((sys != null && sys >= 140) || (dia != null && dia >= 90)) return 'warning';
  if ((sys != null && sys >= 130) || (dia != null && dia >= 80)) return 'caution';
  return 'normal';
}

export function hrStatus(hr) {
  if (hr == null) return 'none';
  if (hr < 60 || hr > 100) return 'warning';
  if (hr > 90) return 'caution';
  return 'normal';
}

export function sugarStatus(sugar) {
  if (sugar == null) return 'none';
  if (sugar >= 180) return 'warning';
  if (sugar >= 140) return 'caution';
  return 'normal';
}

function latestWith(sorted, predicate) {
  return sorted.find(predicate) || null;
}

export function summarizeVitals(readings = []) {
  const sorted = readings
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const latestBP = latestWith(sorted, (r) => r.systolic != null || r.diastolic != null);
  const latestHeart = latestWith(sorted, (r) => r.hr != null);
  const latestSugar = latestWith(sorted, (r) => r.sugar != null);
  const latestWeight = latestWith(sorted, (r) => r.weight != null);

  return {
    count: readings.length,
    lastReading: sorted[0] || null,
    bp: {
      avgSys: average(readings.map((r) => r.systolic)),
      avgDia: average(readings.map((r) => r.diastolic)),
      latest: latestBP,
      status: bpStatus(latestBP?.systolic, latestBP?.diastolic),
    },
    heart: {
      avg: average(readings.map((r) => r.hr)),
      latest: latestHeart,
      status: hrStatus(latestHeart?.hr),
    },
    sugar: {
      avg: average(readings.map((r) => r.sugar)),
      latest: latestSugar,
      status: sugarStatus(latestSugar?.sugar),
    },
    weight: {
      avg: average(readings.map((r) => r.weight)),
      latest: latestWeight,
      status: latestWeight ? 'normal' : 'none',
    },
  };
}

export function summarizeRecovery(recovery) {
  const tasks = recovery?.tasks || [];
  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const start = recovery?.startDate ? toDate(recovery.startDate) : null;
  const dayCount = start
    ? Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1)
    : 1;

  let phaseIndex = 0;
  PHASE_THRESHOLDS.forEach((threshold, i) => {
    if (progress >= threshold) phaseIndex = i;
  });

  return {
    hasPlan: Boolean(recovery),
    tasks,
    total,
    done,
    pending: total - done,
    progress,
    dayCount,
    remainingDays: Math.max(0, RECOVERY_PLAN_DAYS - dayCount),
    phaseIndex,
    phaseTitle: RECOVERY_PHASE_TITLES[phaseIndex],
  };
}

export const VITAL_STATUS_LABEL = {
  normal: 'طبيعي',
  caution: 'انتباه',
  warning: 'مرتفع',
  none: 'لا بيانات',
};
