# 16 — صفحة البحث (Search) — إعادة التصميم البصري

**التاريخ:** 2026-07-06  
**المسار:** `/{locale}/search` — مثال: `/ar/search`  
**الملفات:** `page.tsx`, `SearchClient.tsx`, `searchPage.module.css`

---

## الهدف

تحسين **الواجهة البصرية** لصفحة البحث بثيم Ananas (cream / gold / coral / violet / blue)
مع **حركات جذب انتباه** وتفاعلية — **دون تغيير** منطق البحث، الفلاتر، URL، أو الـ API.

---

## ما لم يتغيّر (السلوك محفوظ)

| الميزة | التفاصيل |
| ------ | -------- |
| البحث بالكلمات | `q` في URL + `fetchPosts` |
| الفلاتر | قسم، فئة، سعر، صور، ترتيب |
| URL قابل للمشاركة | `router.replace` + query params |
| تحميل الفئات | `fetchCategoriesBySectionId` عند اختيار قسم |
| النتائج | `PostCard` + pagination (`load more`) |
| SEO | `generateMetadata` في `page.tsx` (بدون تعديل) |
| التخطيط | `FeedLayoutClient` + `SideBar` |

---

## الملفات

```
app/[locale]/search/
├── page.tsx              # Server — metadata + sections + layout (بدون تغيير منطقي)
├── SearchClient.tsx      # Client — UI + search logic + motion
└── searchPage.module.css # Ananas theme + animations
```

---

## ثيم الألوان (CSS variables)

معرّفة محلياً في `.wrapper` — متوافقة مع [`01-overview.md`](./01-overview.md):

| المتغيّر | القيمة | الاستخدام |
| -------- | ------ | --------- |
| `--an-cream` | `#fffdf7` | خلفيات |
| `--an-gold` | `#fecb01` | accent، chips نشطة |
| `--an-coral` | `#f4a261` | أيقونة البحث |
| `--an-violet` | `#ba7bff` | تدرجات hero |
| `--an-primary` | `#177dc1` | زر البحث، أيقونات |
| `--an-success` | `#0cbc87` | تطبيق الفلاتر |
| `--an-ink` | `#1e1812` | نصوص |
| `--an-line` | `rgba(231,111,81,.14)` | حدود |

---

## هيكل الواجهة

### 1. Hero Card

- **Mesh** دوّار (`conic-gradient`) — خلفية حية
- **Orbs** عائمة (ذهبي + أزرق)
- **Top bar** متدرّج (gold → coral → violet → info)
- **Kicker** «اكتشف / Discover» مع نقطة live نابضة
- أيقونة بحث داخل **ring** نابض
- حقل بحث + فلاتر + زر **«بحث»** (أزرق primary)

### 2. Pills (فلاتر نشطة)

- ظهور animated عند وجود فلاتر
- إزالة سريعة لكل pill + «مسح الكل»

### 3. لوحة الفلاتر (collapsible)

- `AnimatePresence` — expand/collapse
- Grid: قسم، فئة، سعر، صور (chips)
- أزرار: إعادة تعيين + تطبيق (أخضر success)

### 4. Summary Card

- بطاقة منفصلة: عدد النتائج + ترتيب
- shimmer على نص «جاري التحميل...»

### 5. النتائج

- Skeleton بـ shimmer ذهبي
- `PostCard` مع stagger entrance (حتى 6 عناصر)
- Empty state مع ring + أيقونة

### 6. Load More

- زر داكن (`--an-ink`) + hover motion

---

## الحركة (Motion)

| العنصر | المكتبة | ملاحظات |
| ------ | ------- | ------- |
| Hero | `motion/react` | fade + slide up |
| أيقونة Hero | spring | rotate + scale |
| Filters panel | `AnimatePresence` | height + opacity |
| Pills | fade in | عند ظهور فلاتر |
| Results | stagger | `delay: idx * 0.03` capped at 6 |
| Buttons | `whileHover` / `whileTap` | فلاتر، بحث، load more |

### إتاحة — `useReducedMotion()`

عند تفعيل «تقليل الحركة» في النظام:

- تُلغى animations CSS (mesh، orbs، shimmer، …)
- تُلغى transforms على hover
- motion يستخدم `initial: false` بدون delay

---

## تغييرات النص (UX فقط)

| المفتاح | ar | en |
| ------- | -- | -- |
| `searchBtn` | بحث | Search |
| `kicker` | اكتشف | Discover |

زر الإرسال كان يعرض `heroTitle` («ابحث في المنشورات») — أصبح «بحث» / «Search» أوضح.

---

## CSS — Keyframes

| الاسم | الغرض |
| ----- | ----- |
| `searchMeshSpin` | دوران mesh الخلفية |
| `searchOrbFloat` | طفو الـ orbs |
| `searchRingPulse` | نبض حلقة الأيقونة |
| `searchLivePulse` | نقطة kicker |
| `searchBadgePop` | ظهور badge الفلاتر |
| `searchShimmer` | skeleton loading |

---

## Responsive

- ≤768px: hero أصغر، grid فلاتر عمود واحد، زر البحث full-width
- sort select يأخذ عرض كامل تحت العداد

---

## QA Checklist

- [ ] `/ar/search` — hero + mesh يظهران
- [ ] البحث بكلمة → URL يتحدّث + نتائج
- [ ] فتح/إغلاق الفلاتر — animation سلس
- [ ] pills تظهر وتُزال
- [ ] sort يغيّر النتائج فوراً
- [ ] load more يعمل
- [ ] empty state عند لا نتائج
- [ ] `prefers-reduced-motion` — بدون حركة مزعجة
- [ ] RTL (`/ar/search`) — padding واتجاه صحيح

---

## مراجع

- [`01-overview.md`](./01-overview.md) — ثيم العلامة
- [`06-mobile-ai-dashboard.md`](./06-mobile-ai-dashboard.md) — mesh + motion patterns
- [`10-changelog.md`](./10-changelog.md) — سجل التغيير
