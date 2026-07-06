# 17 — صفحة «منشوراتي» (My Posts UI)

توثيق إعادة تصميم صفحة **`/[locale]/my-posts`** — لوحة تحكم عصرية لإعلانات المستخدم مع حركات وتفاعلات (Motion)، متسقة مع ثيم أناناس (ذهبي / كريمي).

**التاريخ:** 2026-07-06  
**المسار:** `http://jo.localhost:3000/ar/my-posts`

---

## 1. الملفات المتأثرة

| الملف | الدور |
| ----- | ----- |
| `app/[locale]/my-posts/MyPostsClient.tsx` | الصفحة الرئيسية — hero، إحصائيات، فلاتر، قائمة |
| `app/[locale]/my-posts/MyPostListItem.tsx` | **جديد** — بطاقة إعلان مضغوطة مع إجراءات |
| `app/[locale]/my-posts/myPosts.module.css` | تصميم كامل (~550 سطر) |
| `app/[locale]/my-posts/page.tsx` | عرض أوسع `Col lg={9}` |
| `app/[locale]/my-posts/layout.tsx` | skeleton تحميل + حماية auth |
| `app/api/posts/my-posts/route.ts` | *(بدون تغيير)* BFF للـ API |

---

## 2. الهيكل البصري

```
┌─ .page (gradient background) ─────────────────────┐
│  ┌─ .shell (glass card) ────────────────────────┐ │
│  │  HERO                                         │ │
│  │    • mesh animated gradient                   │ │
│  │    • عنوان + وصف + زر «إعلان جديد»           │ │
│  │    • 4 stat cards (الكل/نشط/قيد المراجعة/مميز)│ │
│  ├─ TOOLBAR ────────────────────────────────────┤ │
│  │    • filter pills + عداد النتائج              │ │
│  ├─ LIST ───────────────────────────────────────┤ │
│  │    • MyPostListItem × N (stagger animation)   │ │
│  │    • empty state متحرك                        │ │
│  │    • load more                                │ │
│  └───────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

---

## 3. MyPostsClient

### الميزات

- **Hero dashboard** — خلفية mesh دوّارة (`@keyframes meshSpin`)
- **Stat cards تفاعلية** — النقر يغيّر الفلتر؛ `whileHover` / `whileTap` (Motion)
- **Filter rail** — pills مع حالة active بظل ذهبي
- **AnimatePresence** — انتقال سلس عند تغيير الفلتر / empty state
- **Load more** — pagination عبر `fetchMyPosts` (15/صفحة)
- **FeaturePostModal** — تمييز الإعلان (كما كان)
- **`useReducedMotion`** — تعطيل الحركات لمن يفضّل تقليل الحركة

### الفلاتر

| المفتاح | المنطق |
| ------- | ------ |
| `all` | كل المنشورات |
| `active` | `status === 'active'` |
| `pending` | `pending_review` أو `pending` |
| `featured` | `is_featured_active` أو `promotion.is_active` |

### النصوص

- ثنائية اللغة (`ar` / `en`) عبر كائن `copy` داخل `useMemo`

---

## 4. MyPostListItem

بطاقة أفقية خفيفة **بدلاً من PostCard كامل** — أسرع وأوضح لصفحة «إدارة إعلاناتي».

### المحتوى

| العنصر | المصدر |
| ------ | ------ |
| صورة مصغرة 72×72 | `post_images[0]` أو placeholder حرف |
| عنوان + badge حالة | `title`, `status`, featured |
| meta | مدينة، وقت (`timeSince`)، سعر |
| mini stats | views, likes, comments |
| إجراءات | تعديل · إحصائيات · تمييز (إن وُجد) |
| قائمة ⋮ | عرض · حذف (مع تأكيد inline) |

### badges الحالة

| tone | الحالة |
| ---- | ------ |
| `active` | نشط — أخضر |
| `pending` | قيد المراجعة — برتقالي |
| `featured` | مميز — ذهبي |
| `rejected` | مرفوض — أحمر |
| `muted` | أخرى |

### الحركات

- دخول staggered حسب `index`
- `whileHover: { y: -2 }` على الصف
- قائمة منسدلة بـ `scale` + `opacity`

---

## 5. التصميم (CSS)

### متغيرات العلامة

```css
--mp-gold: #fecb01;
--mp-cream tones + radial gradients;
--mp-radius: 22px;
```

### أنماط بارزة

| Class | الغرض |
| ----- | ----- |
| `.page` | خلفية الصفحة الكاملة |
| `.shell` | بطاقة زجاجية رئيسية |
| `.hero` / `.heroMesh` | رأس متحرك |
| `.statGrid` / `.statCard` | بطاقات الإحصائيات |
| `.filterRail` / `.filterPill` | شريط الفلاتر |
| `.postRow` | صف إعلان |
| `.emptyState` | حالة فارغة + `@keyframes floatIcon` |
| `.skeletonHero` / `.skeletonRow` | تحميل shimmer |

### Responsive `<768px`

- stat grid → 2 أعمدة
- post row → عمودين؛ الإجراءات في صف سفلي
- إخفاء نص أزرار الإجراءات (أيقونات فقط)

### Accessibility

- `prefers-reduced-motion: reduce` — إيقاف mesh / float / shimmer
- `dir="rtl"` / `ltr` على `<main>`
- `aria-expanded` على قائمة ⋮

---

## 6. Auth & Loading

`layout.tsx`:

- غير مسجّل → redirect إلى `/auth/sign-in?callbackUrl=...`
- `loading` → skeleton shimmer (hero + 4 rows)

---

## 7. الوظائف المحفوظة

| الوظيفة | التنفيذ |
| ------- | ------- |
| جلب المنشورات | SSR `loadMyPosts` + client `fetchMyPosts` |
| حذف | `deletePost` + token الجلسة |
| تعديل | Link → `/post/[id]/edit` |
| إحصائيات | Link → `/post/[id]/statistics` |
| تمييز | `FeaturePostModal` |
| فلترة | client-side على القائمة المحمّلة |

---

## 8. اختبار يدوي

- [ ] `/ar/my-posts` — hero + 4 stat cards
- [ ] النقر على stat card يفلتر القائمة
- [ ] filter pills تعمل + عداد «عرض X من Y»
- [ ] بطاقة إعلان: صورة، عنوان، badge، stats
- [ ] تعديل / إحصائيات / تمييز
- [ ] حذف مع تأكيد
- [ ] empty state عند فلتر فارغ
- [ ] load more (عند >15 إعلان)
- [ ] RTL عربي + LTR إنجليزي
- [ ] reduced motion في إعدادات النظام

---

## 9. سجل التعديلات

| التاريخ | التعديل |
| ------- | ------- |
| 2026-07-06 | إعادة تصميم كاملة — MyPostListItem + dashboard UI + Motion |

---

## مراجع

- [`16-post-card-listing-ui.md`](./16-post-card-listing-ui.md) — PostCard في الخلاصة
- [`14-featured-posts-promotion.md`](./14-featured-posts-promotion.md) — FeaturePostModal
