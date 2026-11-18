// src/utils/carePlans.js
const STORAGE_PREFIX = 'doseme-care-plans:';
const PATIENT_PREFIX = 'doseme-patient-care-plan:';

function patientPlanKey(email) {
  return `${PATIENT_PREFIX}${(email || '').trim().toLowerCase()}`;
}

export function todayISO() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function addDaysISO(iso, days) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  date.setDate(date.getDate() + days);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function makeRowId(prefix = 'row') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadCarePlans(doctorEmail) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${(doctorEmail || 'guest').toLowerCase()}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return {};
}

export function saveCarePlans(doctorEmail, plans) {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${(doctorEmail || 'guest').toLowerCase()}`,
      JSON.stringify(plans || {})
    );
  } catch {}
}

export function getCarePlan(plans, patientId) {
  if (!plans || patientId == null) return null;
  return plans[String(patientId)] || null;
}

export function createDraft(patient = {}, doctor = {}) {
  const start = todayISO();
  const doctorName = doctor?.fullName || doctor?.name || 'الطبيب';
  return {
    patientId: String(patient?.id ?? ''),
    patientName: patient?.name || '',
    patientEmail: patient?.email || '',
    doctorName,
    diagnosis: patient?.condition || '',
    startDate: start,
    endDate: addDaysISO(start, 30),
    notes: '',
    goals: [{ id: makeRowId('goal'), text: '' }],
    tasks: [{ id: makeRowId('task'), text: '', frequency: 'يومياً' }],
    medications: [{ id: makeRowId('med'), name: '', dose: '', frequency: '' }],
  };
}

export function cleanRows(rows = []) {
  return rows
    .map((row) => {
      const cleaned = { ...row };
      Object.keys(cleaned).forEach((key) => {
        if (typeof cleaned[key] === 'string') cleaned[key] = cleaned[key].trim();
      });
      return cleaned;
    })
    .filter((row) => {
      if ('text' in row) return Boolean(row.text);
      if ('name' in row) return Boolean(row.name);
      return false;
    });
}

export function upsertCarePlan(doctorEmail, plan) {
  const plans = loadCarePlans(doctorEmail);
  const key = String(plan.patientId);
  const previous = plans[key];

  plans[key] = plan;
  saveCarePlans(doctorEmail, plans);

  if (
    previous?.patientEmail &&
    previous.patientEmail.toLowerCase() !== (plan.patientEmail || '').toLowerCase()
  ) {
    removePatientCarePlan(previous.patientEmail);
  }
  savePatientCarePlan(plan);

  return plans;
}

export function removeCarePlan(doctorEmail, patientId) {
  const plans = loadCarePlans(doctorEmail);
  const existing = plans[String(patientId)];
  if (existing?.patientEmail) removePatientCarePlan(existing.patientEmail);
  delete plans[String(patientId)];
  saveCarePlans(doctorEmail, plans);
  return plans;
}

/* ── Shared plan visible to the patient account ── */
export function savePatientCarePlan(plan) {
  const email = (plan?.patientEmail || '').trim();
  if (!email) return;
  try {
    localStorage.setItem(
      patientPlanKey(email),
      JSON.stringify({ ...plan, patientEmail: email })
    );
  } catch {}
}

export function loadPatientCarePlan(email) {
  if (!(email || '').trim()) return null;
  try {
    const raw = localStorage.getItem(patientPlanKey(email));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function removePatientCarePlan(email) {
  try {
    localStorage.removeItem(patientPlanKey(email));
  } catch {}
}
