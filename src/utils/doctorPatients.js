// src/utils/doctorPatients.js
const STORAGE_PREFIX = 'doseme-doctor-patients:';

function isoOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const PATIENT_STATUS = {
  stable: { label: 'مستقر', tone: 'green' },
  followup: { label: 'يحتاج متابعة', tone: 'amber' },
  new: { label: 'مريض جديد', tone: 'blue' },
};

export function buildSeedPatients() {
  return [
    {
      id: 1, name: 'أحمد علي', email: 'ahmed.ali@doseme.com', specialty: 'أمراض القلب', age: 54, gender: 'ذكر', phone: '01012345678',
      condition: 'ارتفاع ضغط الدم', bloodType: 'O+', status: 'stable',
      adherence: 92, lastVisit: isoOffset(-4), nextVisit: isoOffset(0),
      appointmentTime: '٠٩:٣٠ ص',
      notes: 'الضغط مستقر نسبياً. الاستمرار على نفس الجرعة مع قياس صباحي ومسائي.',
    },
    {
      id: 2, name: 'منى إبراهيم', email: 'mona.ibrahim@doseme.com', specialty: 'الغدد الصماء والسكري', age: 47, gender: 'أنثى', phone: '01123456789',
      condition: 'السكري من النوع الثاني', bloodType: 'A+', status: 'followup',
      adherence: 64, lastVisit: isoOffset(-7), nextVisit: isoOffset(0),
      appointmentTime: '١١:٠٠ ص',
      notes: 'ارتفاع متكرر في سكر الصباح. مراجعة جرعة الميتفورمين والنظام الغذائي.',
    },
    {
      id: 3, name: 'خالد محمود', email: 'khaled.mahmoud@doseme.com', specialty: 'أمراض القلب', age: 61, gender: 'ذكر', phone: '01234567890',
      condition: 'أمراض القلب', bloodType: 'B+', status: 'stable',
      adherence: 88, lastVisit: isoOffset(-10), nextVisit: isoOffset(1),
      appointmentTime: '١٠:١٥ ص',
      notes: 'تحسن في أعراض ضيق النفس. متابعة تخطيط القلب بعد أسبوع.',
    },
    {
      id: 4, name: 'سارة حسن', email: 'sara.hassan@doseme.com', specialty: 'الجهاز التنفسي', age: 33, gender: 'أنثى', phone: '01098765432',
      condition: 'الربو', bloodType: 'AB+', status: 'new',
      adherence: 75, lastVisit: isoOffset(0), nextVisit: isoOffset(2),
      appointmentTime: '١٢:٤٥ م',
      notes: 'أول زيارة. بدء خطة علاج وبخاخ عند الحاجة مع تعليمات الاستخدام.',
    },
    {
      id: 5, name: 'محمد سعيد', email: 'mohamed.saeed@doseme.com', specialty: 'الكلى والمسالك', age: 58, gender: 'ذكر', phone: '01187654321',
      condition: 'الفشل الكلوي المزمن', bloodType: 'O-', status: 'followup',
      adherence: 57, lastVisit: isoOffset(-14), nextVisit: isoOffset(3),
      appointmentTime: '٠٢:٠٠ م',
      notes: 'متابعة وظائف الكلى والسوائل. تقليل الملح والبروتين حسب الخطة.',
    },
    {
      id: 6, name: 'هالة فؤاد', email: 'hala.fouad@doseme.com', specialty: 'الغدد الصماء والسكري', age: 42, gender: 'أنثى', phone: '01276543210',
      condition: 'الغدة الدرقية', bloodType: 'A-', status: 'stable',
      adherence: 96, lastVisit: isoOffset(-20), nextVisit: isoOffset(7),
      appointmentTime: '٠٩:٠٠ ص',
      notes: 'نتائج التحاليل مستقرة. إعادة التحليل بعد شهرين.',
    },
    {
      id: 7, name: 'عمر ياسر', email: 'omar.yasser@doseme.com', specialty: 'الباطنة العامة', age: 29, gender: 'ذكر', phone: '01065432109',
      condition: 'حساسية البنسلين', bloodType: 'B-', status: 'new',
      adherence: 70, lastVisit: isoOffset(-1), nextVisit: isoOffset(5),
      appointmentTime: '٠٣:٣٠ م',
      notes: 'تسجيل الحساسية في الملف ومنع وصف البنسلين ومشتقاته.',
    },
  ];
}

export function loadPatients(email) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${(email || 'guest').toLowerCase()}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const seeds = buildSeedPatients();
        return parsed.map((patient) => {
          const seed = seeds.find((s) => s.id === patient.id);
          const email = patient.email || seed?.email || '';
          const specialty = patient.specialty || seed?.specialty || '';
          if (email === patient.email && specialty === patient.specialty) return patient;
          return { ...patient, email, specialty };
        });
      }
    }
  } catch {}
  return buildSeedPatients();
}

export function savePatients(email, patients) {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${(email || 'guest').toLowerCase()}`,
      JSON.stringify(patients)
    );
  } catch {}
}
