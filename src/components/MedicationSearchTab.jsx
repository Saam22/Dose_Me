// src/components/MedicationSearchTab.jsx
import React, { useMemo, useState } from 'react';
import './MedicationSearchTab.css';

const CATEGORY_ICONS = {
  'مسكنات': 'healing',
  'مضادات حيوية': 'coronavirus',
  'القلب والضغط': 'cardiology',
  'السكري': 'glucose',
  'الحساسية': 'allergy',
  'المعدة': 'gastroenterology',
  'الجهاز التنفسي': 'pulmonology',
  'فيتامينات ومكملات': 'medication',
};

const MEDICATIONS = [
  {
    id: 'paracetamol', nameAr: 'باراسيتامول', nameEn: 'Paracetamol',
    category: 'مسكنات', form: 'أقراص', rx: false,
    uses: 'تسكين الألم الخفيف إلى المتوسط وخفض الحرارة.',
    dosage: '٥٠٠–١٠٠٠ ملغ كل ٤–٦ ساعات، بحد أقصى ٤ غرام يومياً.',
    warnings: 'تجنب الجرعات الزائدة، والحذر في أمراض الكبد.',
  },
  {
    id: 'ibuprofen', nameAr: 'إيبوبروفين', nameEn: 'Ibuprofen',
    category: 'مسكنات', form: 'أقراص', rx: false,
    uses: 'تخفيف الألم والالتهاب والصداع وآلام الدورة الشهرية.',
    dosage: '٢٠٠–٤٠٠ ملغ كل ٦–٨ ساعات بعد الأكل.',
    warnings: 'الحذر في قرحة المعدة وأمراض الكلى، ويُفضل تناوله بعد الطعام.',
  },
  {
    id: 'diclofenac', nameAr: 'ديكلوفيناك', nameEn: 'Diclofenac',
    category: 'مسكنات', form: 'أقراص / جل', rx: false,
    uses: 'آلام المفاصل والعضلات والالتهابات الموضعية.',
    dosage: '٥٠ ملغ مرتين إلى ثلاث مرات يومياً بعد الأكل.',
    warnings: 'قد يسبب اضطراباً في المعدة، يُستخدم بحذر مع أدوية السيولة.',
  },
  {
    id: 'aspirin', nameAr: 'أسبرين', nameEn: 'Aspirin',
    category: 'مسكنات', form: 'أقراص', rx: false,
    uses: 'تسكين الألم، وخفض الحرارة، ووقاية القلب بجرعات صغيرة.',
    dosage: '٧٥–١٠٠ ملغ يومياً للوقاية، أو ٣٠٠–٦٠٠ ملغ للألم.',
    warnings: 'تجنب استخدامه مع قرحة المعدة أو اضطرابات النزيف.',
  },
  {
    id: 'amoxicillin', nameAr: 'أموكسيسيلين', nameEn: 'Amoxicillin',
    category: 'مضادات حيوية', form: 'كبسولات', rx: true,
    uses: 'علاج الالتهابات البكتيرية في الجهاز التنفسي والأذن والحلق.',
    dosage: '٥٠٠ ملغ كل ٨ ساعات، مع إكمال كورس العلاج كاملاً.',
    warnings: 'يحتاج وصفة طبية، وتجنبه عند حساسية البنسلين.',
  },
  {
    id: 'augmentin', nameAr: 'أوجمنتين', nameEn: 'Augmentin',
    category: 'مضادات حيوية', form: 'أقراص', rx: true,
    uses: 'التهابات بكتيرية أوسع طيفاً، خاصة الجهاز التنفسي والمسالك.',
    dosage: '٦٢٥ ملغ كل ١٢ ساعة حسب وصف الطبيب.',
    warnings: 'يحتاج وصفة طبية، وقد يسبب إسهالاً أو حساسية.',
  },
  {
    id: 'azithromycin', nameAr: 'أزيثرومايسين', nameEn: 'Azithromycin',
    category: 'مضادات حيوية', form: 'أقراص', rx: true,
    uses: 'الالتهابات التنفسية والجلدية وبعض التهابات الأذن.',
    dosage: '٥٠٠ ملغ يومياً لمدة ٣ أيام أو حسب الوصفة.',
    warnings: 'يحتاج وصفة طبية، والحذر في مشاكل ضربات القلب.',
  },
  {
    id: 'ciprofloxacin', nameAr: 'سيبروفلوكساسين', nameEn: 'Ciprofloxacin',
    category: 'مضادات حيوية', form: 'أقراص', rx: true,
    uses: 'التهابات المسالك البولية والجهاز الهضمي.',
    dosage: '٥٠٠ ملغ مرتين يومياً حسب وصف الطبيب.',
    warnings: 'يحتاج وصفة طبية، وتجنب تناوله مع الحليب أو مضادات الحموضة.',
  },
  {
    id: 'amlodipine', nameAr: 'أملوديبين', nameEn: 'Amlodipine',
    category: 'القلب والضغط', form: 'أقراص', rx: true,
    uses: 'علاج ارتفاع ضغط الدم والذبحة الصدرية.',
    dosage: '٥–١٠ ملغ مرة واحدة يومياً.',
    warnings: 'قد يسبب تورم الكاحل، ويحتاج متابعة دورية للضغط.',
  },
  {
    id: 'lisinopril', nameAr: 'ليزينوبريل', nameEn: 'Lisinopril',
    category: 'القلب والضغط', form: 'أقراص', rx: true,
    uses: 'ارتفاع ضغط الدم وفشل القلب وبعض أمراض الكلى.',
    dosage: '٥–٢٠ ملغ مرة واحدة يومياً.',
    warnings: 'قد يسبب كحة جافة، ويُمنع في الحمل.',
  },
  {
    id: 'bisoprolol', nameAr: 'بيسوبرولول', nameEn: 'Bisoprolol',
    category: 'القلب والضغط', form: 'أقراص', rx: true,
    uses: 'تنظيم ضربات القلب وعلاج ارتفاع الضغط.',
    dosage: '٢٫٥–١٠ ملغ مرة واحدة يومياً.',
    warnings: 'قد يبطئ النبض، ولا يُوقف فجأة دون استشارة الطبيب.',
  },
  {
    id: 'furosemide', nameAr: 'فوروسيميد', nameEn: 'Furosemide',
    category: 'القلب والضغط', form: 'أقراص', rx: true,
    uses: 'مدر للبول لعلاج احتباس السوائل وارتفاع الضغط.',
    dosage: '٢٠–٤٠ ملغ صباحاً حسب الحالة.',
    warnings: 'قد يسبب نقص البوتاسيوم، ويُفضل تناوله في الصباح.',
  },
  {
    id: 'atorvastatin', nameAr: 'أتورفاستاتين', nameEn: 'Atorvastatin',
    category: 'القلب والضغط', form: 'أقراص', rx: true,
    uses: 'خفض الكوليسترول والدهون لتقليل خطر أمراض القلب.',
    dosage: '١٠–٨٠ ملغ مرة واحدة يومياً مساءً.',
    warnings: 'آلام العضلات غير المعتادة تستدعي استشارة الطبيب.',
  },
  {
    id: 'metformin', nameAr: 'ميتفورمين', nameEn: 'Metformin',
    category: 'السكري', form: 'أقراص', rx: true,
    uses: 'الخط الأول لعلاج السكري من النوع الثاني.',
    dosage: '٥٠٠ ملغ مرة إلى مرتين يومياً مع الأكل.',
    warnings: 'قد يسبب اضطراباً في المعدة، ويُستخدم بحذر مع أمراض الكلى.',
  },
  {
    id: 'insulin', nameAr: 'إنسولين', nameEn: 'Insulin',
    category: 'السكري', form: 'حقن', rx: true,
    uses: 'ضبط سكر الدم في السكري من النوع الأول أو المتقدم.',
    dosage: 'حسب الجرعة الموصوفة وقياس السكر بانتظام.',
    warnings: 'يجب متابعة السكر بانتظام، والحذر من هبوط السكر.',
  },
  {
    id: 'loratadine', nameAr: 'لوراتادين', nameEn: 'Loratadine',
    category: 'الحساسية', form: 'أقراص', rx: false,
    uses: 'علاج حساسية الأنف والعين والأرتيكاريا.',
    dosage: '١٠ ملغ مرة واحدة يومياً.',
    warnings: 'قد يسبب نعاساً خفيفاً لدى بعض الأشخاص.',
  },
  {
    id: 'cetirizine', nameAr: 'سيتريزين', nameEn: 'Cetirizine',
    category: 'الحساسية', form: 'أقراص', rx: false,
    uses: 'تخفيف أعراض الحساسية والرشح والعطس.',
    dosage: '١٠ ملغ مرة واحدة يومياً.',
    warnings: 'قد يسبب نعاساً، ويُتجنب مع القيادة عند الشعور به.',
  },
  {
    id: 'omeprazole', nameAr: 'أوميبرازول', nameEn: 'Omeprazole',
    category: 'المعدة', form: 'كبسولات', rx: false,
    uses: 'علاج الحموضة والارتجاع وقرحة المعدة.',
    dosage: '٢٠–٤٠ ملغ قبل الإفطار بنحو ٣٠ دقيقة.',
    warnings: 'الاستخدام طويل الأمد يحتاج متابعة طبية.',
  },
  {
    id: 'pantoprazole', nameAr: 'بانتوبرازول', nameEn: 'Pantoprazole',
    category: 'المعدة', form: 'أقراص', rx: false,
    uses: 'علاج ارتجاع المريء وحرقة المعدة.',
    dosage: '٤٠ ملغ مرة واحدة يومياً قبل الأكل.',
    warnings: 'قد يسبب صداعاً أو اضطراباً هضمياً بسيطاً.',
  },
  {
    id: 'salbutamol', nameAr: 'سالبوتامول', nameEn: 'Salbutamol',
    category: 'الجهاز التنفسي', form: 'بخاخ', rx: true,
    uses: 'توسيع الشعب الهوائية وتسريع التنفس في الربو.',
    dosage: 'بخة أو بختان عند الحاجة حسب خطة الطبيب.',
    warnings: 'الاستخدام المتكرر قد يسبب رجفة أو تسارع نبض.',
  },
  {
    id: 'vitamin-d', nameAr: 'فيتامين د', nameEn: 'Vitamin D3',
    category: 'فيتامينات ومكملات', form: 'كبسولات', rx: false,
    uses: 'تقوية العظام وتعويض نقص فيتامين د.',
    dosage: '١٠٠٠–٢٠٠٠ وحدة دولية يومياً حسب النقص.',
    warnings: 'الجرعات العالية تحتاج إشرافاً طبياً.',
  },
  {
    id: 'vitamin-c', nameAr: 'فيتامين سي', nameEn: 'Vitamin C',
    category: 'فيتامينات ومكملات', form: 'أقراص', rx: false,
    uses: 'دعم المناعة وتحسين امتصاص الحديد.',
    dosage: '٥٠٠ ملغ يومياً.',
    warnings: 'الجرعات الكبيرة قد تسبب اضطراباً هضمياً.',
  },
  {
    id: 'iron', nameAr: 'حديد', nameEn: 'Ferrous Sulfate',
    category: 'فيتامينات ومكملات', form: 'أقراص', rx: false,
    uses: 'علاج الأنيميا ونقص الحديد.',
    dosage: 'حبة يومياً أو حسب الوصفة، مع فيتامين سي لتحسين الامتصاص.',
    warnings: 'قد يسبب إمساكاً أو تغيراً في لون البراز.',
  },
];

const CATEGORIES = ['الكل', ...Object.keys(CATEGORY_ICONS)];

function normalize(value) {
  return (value || '')
    .toString()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

function MedicationCard({ med }) {
  const icon = CATEGORY_ICONS[med.category] || 'medication';
  return (
    <article className="drug-card">
      <div className="drug-card__head">
        <div className="drug-card__icon">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="drug-card__titles">
          <h3 className="drug-card__name">{med.nameAr}</h3>
          <p className="drug-card__en">{med.nameEn}</p>
        </div>
        <div className="drug-card__tags">
          <span className="drug-tag drug-tag--category">{med.category}</span>
          <span className="drug-tag drug-tag--form">{med.form}</span>
          {med.rx
            ? <span className="drug-tag drug-tag--rx">وصفة طبية</span>
            : <span className="drug-tag drug-tag--otc">بدون وصفة</span>}
        </div>
      </div>

      <div className="drug-card__body">
        <div className="drug-row">
          <span className="drug-row__icon material-symbols-outlined">info</span>
          <div>
            <span className="drug-row__label">الاستخدامات</span>
            <p className="drug-row__text">{med.uses}</p>
          </div>
        </div>
        <div className="drug-row">
          <span className="drug-row__icon material-symbols-outlined">schedule</span>
          <div>
            <span className="drug-row__label">الجرعة المعتادة</span>
            <p className="drug-row__text">{med.dosage}</p>
          </div>
        </div>
        <div className="drug-row drug-row--warning">
          <span className="drug-row__icon material-symbols-outlined">warning</span>
          <div>
            <span className="drug-row__label">تحذيرات</span>
            <p className="drug-row__text">{med.warnings}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MedicationSearchTab() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('الكل');

  const results = useMemo(() => {
    const q = normalize(query);
    return MEDICATIONS.filter(med => {
      const inCategory = category === 'الكل' || med.category === category;
      if (!inCategory) return false;
      if (!q) return true;
      const haystack = normalize([
        med.nameAr, med.nameEn, med.category, med.uses, med.form,
      ].join(' '));
      return haystack.includes(q);
    });
  }, [query, category]);

  const clearSearch = () => {
    setQuery('');
    setCategory('الكل');
  };

  return (
    <div className="drug-page">
      <div className="drug-page__header">
        <div>
          <h2 className="drug-page__title">
            <span className="material-symbols-outlined">manage_search</span>
            البحث عن دواء
          </h2>
          <p className="drug-page__sub">ابحث بالاسم العربي أو الإنجليزي أو الفئة العلاجية</p>
        </div>
      </div>

      {/* ── Search bar ──────────────────────── */}
      <div className="drug-search">
        <span className="material-symbols-outlined drug-search__icon">search</span>
        <input
          type="search"
          className="drug-search__input"
          placeholder="ابحث عن دواء... مثال: باراسيتامول، Aspirin، ضغط"
          value={query}
          onChange={e => setQuery(e.target.value)}
          aria-label="البحث عن دواء"
        />
        {(query || category !== 'الكل') && (
          <button className="drug-search__clear" onClick={clearSearch} aria-label="مسح البحث">
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* ── Category chips ──────────────────── */}
      <div className="drug-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`drug-filter ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat !== 'الكل' && (
              <span className="material-symbols-outlined">{CATEGORY_ICONS[cat]}</span>
            )}
            {cat}
          </button>
        ))}
      </div>

      {/* ── Results ─────────────────────────── */}
      <div className="drug-results-meta">
        <span>
          <strong>{results.length}</strong> نتيجة
          {query && <> عن «{query}»</>}
        </span>
      </div>

      {results.length === 0 ? (
        <div className="drug-empty">
          <span className="material-symbols-outlined">search_off</span>
          <h3>لا توجد نتائج مطابقة</h3>
          <p>جرّب اسماً آخر أو غيّر الفئة العلاجية.</p>
          <button className="drug-empty__btn" onClick={clearSearch}>إعادة ضبط البحث</button>
        </div>
      ) : (
        <div className="drug-grid">
          {results.map(med => <MedicationCard key={med.id} med={med} />)}
        </div>
      )}

      <div className="drug-disclaimer">
        <span className="material-symbols-outlined">health_and_safety</span>
        <p>
          المعلومات هنا إرشادية فقط ولا تغني عن استشارة الطبيب أو الصيدلي.
          لا تبدأ أو توقف أي دواء دون وصفة طبية.
        </p>
      </div>
    </div>
  );
}
