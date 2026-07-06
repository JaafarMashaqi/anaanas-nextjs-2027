# 18 — إحصائيات الملف الشخصي وإحصائيات الإعلان

توثيق إعادة تصميم صفحتي الإحصائيات مع توسيع البيانات من نظام التحليلات والتمييز المدفوع.

## الروابط

| الصفحة | المسار |
|--------|--------|
| إحصائيات الملف الشخصي | `/{locale}/profile/statistics` |
| إحصائيات إعلان واحد | `/{locale}/post/{id}/statistics` |

## نظرة عامة

تم توحيد الهوية البصرية عبر وحدة مشتركة (`components/statistics/`) مع الحفاظ على كل الميزات السابقة وإضافة مقاييس ورسوم بيانية جديدة مرتبطة بـ:

- **MongoDB `post_events`** — ظهور، مشاهدات، تفاعلات، تعليقات، إلخ.
- **MongoDB `promotion_events`** — ظهور مميز، تثبيت الرئيسية، منبثق، تعزيز القوائم.
- **التفاعلات التعبيرية** — like / love / care / haha / wow / sad / angry.
- **الجمهور** — أهم User-Agent.
- **التمييز المدفوع** — فترات التمييز، KPIs، مخطط يومي.

## الوحدة المشتركة (Frontend)

| الملف | الدور |
|-------|-------|
| `components/statistics/statsTheme.module.css` | ثيم Ananas: mesh hero، KPI grid، chart panels، tabs، جداول |
| `components/statistics/statsUtils.ts` | تنسيق أرقام، تسميات أحداث، ألوان تفاعلات، `PROMOTION_KPI_META` |
| `components/statistics/AnanasStatsMascot.tsx` | شخصية أناناس SVG متحركة في الـ hero |

### ألوان العلامة

- ذهبي `#fecb01` — تفاعلات / تمييز
- بنفسجي `#ba7bff` — ظهور فريد
- أزرق `#177dc1` — ظهور / منشورات
- خلفية كريمية متدرجة مع glass shell

## صفحة إحصائيات الملف الشخصي

**الملف:** `app/[locale]/profile/statistics/statisticsClient.tsx`

### KPIs (12 بطاقة)

| المفتاح | الوصف |
|---------|--------|
| `total_posts` | إجمالي المنشورات (كل الوقت) |
| `active_posts` | المنشورات النشطة |
| `impressions` | الظهور |
| `unique_impressions` | **جديد** — ظهور فريد |
| `views` | المشاهدات |
| `interactions` | مجموع التفاعلات |
| `likes` / `comments` / `calls` / `shares` / `chats` | تفصيل |
| `unlikes` | **جديد** — إلغاء الإعجاب |

### KPIs التمييز (عند وجود بيانات)

- ظهور مميز، مشاهدات الرئيسية، عرض/نقر منبثق، تعزيز القوائم

### التبويبات

1. **نظرة عامة** — خط زمني للمقياس المختار + دائرة توزيع الأحداث
2. **التفاعلات** — أعمدة يومية للتفاعلات + engagement
3. **التفاعلات التعبيرية** — pie + stacked bars حسب النوع
4. **الجمهور** — جدول User-Agent
5. **التمييز** — **جديد** — مخطط أعمدة يومي لأحداث التمييز
6. **أفضل الإعلانات** — **جديد** — أعلى 8 منشورات بالمشاهدات مع رابط لإحصائيات كل إعلان

### فلتر التاريخ

- حقول from/to + أزرار 7 / 30 / 90 يوم
- API: `GET /api/posts/my-statistics`

## صفحة إحصائيات الإعلان

**الملف:** `app/[locale]/post/[id]/statistics/statisticsClient.tsx`

### ما بقي كما هو (محفوظ)

- فلتر التاريخ + presets
- شريط فترات التمييز + حساب **boost lift** (%)
- مخطط خطي مع `ReferenceArea` لفترات التمييز
- تبويبات: نظرة عامة، تفاعلات، تفاعلات تعبيرية، جمهور
- pie breakdown + stacked reaction bars + chips

### تحسينات UI

- hero mesh + `AnanasStatsMascot` من الوحدة المشتركة
- `statsTheme.module.css` للهيكل والأزرار
- KPIs إضافية: likes، comments، unlikes
- قسم «إحصائيات التمييز» بعنوان موحّد
- تبويب **التمييز** — مخطط أعمدة يومي (`promotion_daily`)

### KPIs التمييز

نفس مفاتيح `PROMOTION_KPI_META` مع إصلاح تجميع Backend (انظر أدناه).

### API

`GET /api/posts/{id}/statistics?from=&to=`

## Backend — توسيعات API

**الملف:** `anaanasBackend/app/Http/Controllers/Api/v1/PostController.php`

### `myStatistics()` — جديد/موسّع

| الحقل | الوصف |
|-------|--------|
| `totals.unique_impressions` | ظهور فريد |
| `totals.unlikes` | إلغاء إعجاب |
| `daily[].unique_impressions` | يومي |
| `reactions.by_type` | تفاعلات تعبيرية |
| `reactions.daily_by_type` | يومي حسب النوع |
| `top.user_agents` | جمهور |
| `top.posts` | أفضل 8 منشورات |
| `promotion_totals` | مجاميع التمييز |
| `promotion_daily` | يومي حسب نوع الحدث |
| `featured_posts_count` | عدد المنشورات المميزة |

### `statistics()` — إصلاح

- **إصلاح mapping** أحداث Mongo → مفاتيح `promotion_totals`:
  - `featured_impression` → `featured_impressions`
  - `homepage_pin_view` → `homepage_pin_views`
  - `listing_boost_impression` → `listing_boost_impressions`
- `promotion_daily` يُرجع لكل يوم في النطاق

### مصدر الأحداث (WebSocket)

راجع `websocket-server/server.js` و `docs/14-featured-posts-promotion.md` لتسجيل:

- `post_impression`, `post_view`, `post_like`, …
- `featured_impression`, `homepage_pin_view`, `popup_shown`, `popup_click`, `listing_boost_impression`

> بعض أحداث التمييز قد تظهر بصفر حتى يُفعّل تسجيلها من الواجهة/الخادم.

## Motion وإتاحة

- `motion/react` للـ hero وKPI cards
- `useReducedMotion` في صفحة الملف الشخصي
- RTL عبر `dir="rtl"` على الحاوية الرئيسية (الملف الشخصي)

## QA checklist

- [ ] `/ar/profile/statistics` — تحميل KPIs + تبويبات + فلتر تاريخ
- [ ] تبويب «أفضل الإعلانات» يفتح `/post/{id}/statistics`
- [ ] تبويب «التمييز» يظهر عند وجود بيانات
- [ ] `/ar/post/130/statistics` — hero + mascot + فترات تمييز
- [ ] مخطط خطي يظلل فترات التمييز (ReferenceArea)
- [ ] KPIs التمييز تعكس `promotion_totals` بعد إصلاح Backend
- [ ] unlikes يظهر في KPI row
- [ ] TypeScript: `npx tsc --noEmit` بدون أخطاء

## الملفات المتأثرة

### Frontend

- `app/[locale]/profile/statistics/statisticsClient.tsx` — إعادة كتابة
- `app/[locale]/post/[id]/statistics/statisticsClient.tsx` — تحديث UI + تبويب تمييز
- `app/[locale]/post/[id]/statistics/postStatistics.module.css` — أنماط محلية (KPI، promo chips)
- `components/statistics/*` — **جديد**

### Backend

- `app/Http/Controllers/Api/v1/PostController.php` — `myStatistics` + إصلاح `statistics`
