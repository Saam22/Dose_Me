# DoseMe – Login Page (React)

صفحة تسجيل دخول DoseMe محوّلة من HTML/CSS/JS إلى React مع هيكل components كامل.

---

## 📁 هيكل المشروع

```
DoseMe/
├── index.html                   ← نقطة دخول HTML (Vite)
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 ← ReactDOM.createRoot
    ├── App.jsx                  ← Root component
    │
    ├── styles/
    │   └── theme.css            ← CSS variables (light/dark) + @keyframes
    │
    ├── hooks/
    │   └── useToast.js          ← Custom hook: showToast(msg, type, duration)
    │
    ├── components/
    │   ├── Background.jsx/.css  ← Orbs + grid canvas (position:fixed)
    │   ├── ThemeToggle.jsx/.css ← زر تبديل الثيم (أعلى اليسار)
    │   ├── Logo.jsx/.css        ← أيقونة + عنوان DoseMe
    │   ├── LoginForm.jsx/.css   ← الفورم كامل (validation + states)
    │   ├── HeroSection.jsx/.css ← البانر الجانبي (يظهر > 1024px)
    │   └── Toast.jsx/.css       ← إشعارات الـ Toast
    │
    └── pages/
        ├── LoginPage.jsx        ← الصفحة الرئيسية (تجمع كل الـ components)
        └── LoginPage.css        ← Layout shell (page-wrapper, login-section)
```

---

## 🚀 تشغيل المشروع

```bash
npm install
npm run dev
```

---

## 🧩 الـ Components وأدوارها

| Component       | الدور |
|----------------|-------|
| `Background`    | Canvas متحرك خلف الصفحة (orbs + grid) |
| `ThemeToggle`   | زر تبديل light/dark مع حفظ في localStorage |
| `Logo`          | أيقونة + عنوان DoseMe مع animation |
| `LoginForm`     | الفورم الكامل: validation، password toggle، ripple، loading states |
| `HeroSection`   | البانر الجانبي مع stats و feature cards |
| `Toast`         | إشعارات مؤقتة (success / error / neutral) |
| `useToast`      | Custom hook لإدارة حالة الـ Toast |
| `LoginPage`     | Page تجمع كل الـ components وتوزع الـ state |

---

## 🎨 الثيم

- المتغيرات في `src/styles/theme.css`
- Light mode: `:root { ... }`
- Dark mode: `[data-theme="dark"] { ... }`
- يتم تطبيق الثيم عبر `document.documentElement.setAttribute('data-theme', ...)`

---

## 📦 Props للـ Components

### `ThemeToggle`
```jsx
<ThemeToggle isDark={boolean} onToggle={function} />
```

### `Logo`
```jsx
<Logo onClick={function} />
```

### `LoginForm`
```jsx
<LoginForm
  onSuccess={function(email)}   // يُستدعى بعد تسجيل دخول ناجح
  showToast={function}          // من useToast hook
/>
```

### `Toast`
```jsx
<Toast msg={string} type={'success'|'error'|''} visible={boolean} />
```

### `useToast`
```js
const { toast, showToast } = useToast();
showToast('رسالة', 'success', 3000);
```
