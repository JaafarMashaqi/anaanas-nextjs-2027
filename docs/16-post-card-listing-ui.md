# 16 — PostCard: تصميم بطاقة الإعلان (Listing + Details)

توثيق شامل لإعادة تصميم **`PostCard`** في الخلاصة وصفحة تفاصيل الإعلان، مع **الحفاظ الكامل** على الوظائف والأحداث (تفاعلات، تعليقات، شات، اتصال، مشاركة، تمييز، إحصائيات، مودالات، WebSocket/API).

**التاريخ:** 2026-07-06  
**النطاق:** Frontend فقط — 8 ملفات (~+2,216 / −778 سطر)

---

## فهرس

1. [الملفات المتأثرة](#1-الملفات-المتأثرة)
2. [الخلاصة — Listing Card](#2-الخلاصة--listing-card)
3. [PostActions — شريط الإجراءات](#3-postactions--شريط-الإجراءات)
4. [صفحة التفاصيل](#4-صفحة-التفاصيل)
5. [دوال ومساعدات جديدة](#5-دوال-ومساعدات-جديدة)
6. [CSS Classes رئيسية](#6-css-classes-رئيسية)
7. [سلوك التفاعل والأحداث](#7-سلوك-التفاعل-والأحداث)
8. [التجاوب (Responsive)](#8-التجاوب-responsive)
9. [ما لم يُطبَّق / ملاحظات](#9-ما-لم-يُطبّق--ملاحظات)
10. [اختبار يدوي](#10-اختبار-يدوي)
11. [سجل التعديلات](#11-سجل-التعديلات)

---

## 1. الملفات المتأثرة

| الملف | التغيير |
| ----- | ------- |
| `components/cards/PostCard.tsx` | تفرع listing/details، helpers، stats، info block |
| `components/cards/PostCard.module.css` | ~640 سطر أنماط listing + details shell |
| `components/cards/components/PostActions.tsx` | `layout: marketplace \| default`، كل الإجراءات |
| `components/cards/components/PostActions.module.css` | `marketplaceBar` flex متساوٍ |
| `app/[locale]/post/[id]/page.tsx` | shell التفاصيل: gallery، عنوان، sidebar اتصال |
| `app/[locale]/post/[id]/postDetails.module.css` | تخطيط لوحة التفاصيل + attributes grid |
| `app/[locale]/post/[id]/PostImagesGallery.tsx` | prop `variant="details"` |
| `app/[locale]/post/[id]/PostImagesGallery.module.css` | أنماط معرض التفاصيل |

---

## 2. الخلاصة — Listing Card

### متى يُفعَّل

```ts
const isDetailsPage = Boolean(pathname?.includes('/post/'))
// listing layout عندما: !isDetailsPage
```

البطاقة في الخلاصة تحصل على class `listingCard`؛ في التفاصيل: `detailsShell`.

### الهيكل العمودي

```
┌─ listingHeader ─────────────────────────────┐
│  أفاتار + اسم + ✓ موثّق + مدينة + وقت     │
│  شارات (مميز / قسم)              ⋮ menu   │
├─ listingBody ───────────────────────────────┤
│  listingHero (صورة نظيفة)                 │
│    • شارات علوية (موصى به / طلب مرتفع)    │
│    • عداد صور 1/N                           │
│  listingInfoBlock                           │
│    • عنوان (حتى سطرين) + فئة/مدينة        │
│    • وصف (سطر واحد) + سعر + attribute chips │
│  statsStrip (4 أعمدة)                       │
│  socialProofBar                             │
│  PostActions (marketplace)                  │
│  [تعليقات — عند الضغط «تعليق»]              │
│  زر «مشاهدة الإعلان»                        │
└─────────────────────────────────────────────┘
```

### قرارات UX

| القرار | السبب |
| ------ | ----- |
| العنوان/الوصف **خارج الصورة** | قراءة أوضح — لا نص أبيض فوق صور فاتحة/مشتعلة |
| تخطيط **عمودي** على كل المقاسات | تجنّب توزيع جانبي غير متوازن (صورة يسار / stats يمين) |
| صورة بدون gradient سفلي | gradient علوي خفيف فقط لقراءة الشارات |
| بدون صورة | `listingTextFallback` + `listingLayoutStacked` |

### أبعاد الصورة (`listingHero`)

```css
height: clamp(220px, 58vw, 320px);   /* موبايل */
height: clamp(260px, 34vw, 360px);   /* ≥768px */
height: clamp(280px, 28vw, 360px);   /* ≥992px — stacked فقط */
```

### Props جديدة على PostCard

```ts
detailsIntroMode?: 'full' | 'actionsOnly'
```

| القيمة | الاستخدام |
| ------ | --------- |
| `full` | عنوان + chips + إجراءات داخل البطاقة (افتراضي) |
| `actionsOnly` | العنوان في shell الصفحة؛ البطاقة تعرض menu + إجراءات + وصف فقط |

---

## 3. PostActions — شريط الإجراءات

### Props

```ts
layout?: 'default' | 'marketplace'  // الخلاصة = marketplace
isOwner?: boolean
showFeature?: boolean
onFeature?: () => void
// + props التفاعل/تعليق/مشاركة/شات/اتصال كما كانت
```

### الأزرار في `layout="marketplace"`

| الدور | الأزرار |
| ----- | ------- |
| **غير المالك** | اهتمام · تعليق · مشاركة · **دردشة** · اتصال |
| **المالك** | اهتمام · تعليق · مشاركة · تمييز (إن وُجد) · إحصائيات |

### إصلاح: زر الشات

كان مخفياً بسبب شرط خاطئ:

```tsx
// ❌ قبل — لا يظهر أبداً في marketplace
{!isOwner && !isMarketplace ? chatButton : null}

// ✅ بعد
{!isOwner && chatButton}
```

### تصميم الشريط

- **`marketplaceBar`:** flex أفقي — أزرار **متساوية الحجم**
- زر **اتصال** بلون ذهبي (`marketplaceContact`) لكن **بدون** تمديد grid column كبير
- **`default` bar:** يُستخدم في صفحة التفاصيل — نفس الإجراءات، styling أصلي `.bar`

### reaction picker

- hover (desktop) / long-press (mobile) — **بدون تغيير**
- 7 تفاعلات: like, love, care, haha, wow, sad, angry

---

## 4. صفحة التفاصيل

### الهيكل (`page.tsx`)

```
breadcrumb
PostStatusBanner
detailsHead          ← عنوان H1 + chips + سعر (خارج الصورة)
article
  Col lg=8
    listingPanel
      PostImagesGallery (variant="details")
      PostCard (detailsIntroMode="actionsOnly")
        → attributes grid (dl.attrGrid)
        → PostActions (layout="default")
        → comments
  Col lg=4
    asideSticky
      contactCard    ← أفاتار + هاتف + email + مدينة
```

### تغييرات رئيسية

| قبل | بعد |
| --- | --- |
| عنوان فوق/على الصورة | `detailsHead` بخلفية بيضاء صلبة |
| Bootstrap Table للخصائص | `dl.attrGrid` — بطاقات grid |
| PostCard يعرض كل شيء | العنوان في shell؛ البطاقة `actionsOnly` |
| معرض صور عام | `PostImagesGallery variant="details"` |

### PostImagesGallery

```tsx
<PostImagesGallery
  images={postImages}
  title={title}
  isRtl={isRtl}
  variant="details"   // سطوع خفيف + تخطيط تفاصيل
/>
```

---

## 5. دوال ومساعدات جديدة

### `formatListingPrice(price, currency, locale)`

- تنسيق السعر بـ `Intl.NumberFormat`
- JOD → `د.أ` / `JOD`
- يُرجع `null` إذا السعر غير صالح

### `formatCompactCount(value)`

- `1K`, `1.2M` للإحصائيات

### `extractAttributeChips(post, max = 3)`

- يستخرج حتى 3 chips من `post_data.attributes_and_options`

### `normalizeReactionCounts` + `REACTION_EMOJI`

- عرض social proof bar و reaction pills

---

## 6. CSS Classes رئيسية

### Listing (feed)

| Class | الغرض |
| ----- | ----- |
| `.listingCard` | scope البطاقة في الخلاصة |
| `.listingHeader` / `.listingHeaderRow` | رأس البطاقة |
| `.listingHero` | صورة الغلاف |
| `.listingHeroGradient` | gradient علوي للشارات |
| `.listingInfoBlock` | عنوان + وصف + سعر خارج الصورة |
| `.listingInfoTitle` | H3 العنوان (clamp 2 lines) |
| `.listingPriceTagInline` | badge السعر الأخضر |
| `.listingSpecChipInline` | chips الخصائص |
| `.statsStrip` / `.statItem` | 4 إحصائيات |
| `.socialProofBar` | «X مهتمون» + تفاعلك |
| `.viewAdBtn` | زر مشاهدة الإعلان |
| `.listingCommentsWrap` | composer التعليقات inline |

### Details shell

| Class | الغرض |
| ----- | ----- |
| `.detailsShell` | بطاقة شفافة داخل صفحة التفاصيل |
| `.detailsContent` | padding محتوى التفاصيل |
| `.detailsIntroMode` | (via prop) actions only |
| `.detailsDescriptionBlock` | كتلة الوصف |

### PostActions

| Class | الغرض |
| ----- | ----- |
| `.marketplaceBar` | flex شريط listing |
| `.marketplaceAction` | زر ثانوي listing |
| `.marketplaceContact` | زر اتصال ذهبي متساوٍ |

---

## 7. سلوك التفاعل والأحداث

| الحدث | السلوك | ملاحظة |
| ----- | ------ | ------ |
| نقر البطاقة | `router.push(postDetailsHref)` | يُستثنى الأزرار/links |
| اهتمام | reaction picker + API toggle | analytics socket |
| تعليق | `setShowComments(true)` + scroll + focus | inline في listing |
| مشاركة | `SharePostModal` | — |
| درdشة | `onOpenChat` → ChatContext | يتطلب auth + postId |
| اتصال | ContactModal / `tel:` | — |
| تمييز | `FeaturePostModal` | مالك فقط |
| إحصائيات | `/post/[id]/statistics` | مالك فقط |
| حذف/تعديل | ActionMenu | صلاحيات owner |

### التعليقات

```ts
const [showComments, setShowComments] = useState(isDetailsPage)
```

- **التفاصيل:** مفتوحة افتراضياً
- **الخلاصة:** تُفتح بزر «تعليق» فقط

---

## 8. التجاوب (Responsive)

### statsStrip — موبايل `<768px`

- `.statLabel { display: none }` — صف مضغوط: أيقونة + رقم
- أيقونات 16px

### marketplaceBar — موبايل

- `.label` مخفي بصرياً (sr-only) — أيقونات فقط

### listingHero

- ارتفاع responsive عبر `clamp()` (انظر §2)

---

## 9. ما لم يُطبَّق / ملاحظات

### تعديل «الكثافة المضغوطة» — **ملغى**

في جلسة لاحقة طُلب تصغير البطاقة؛ أُلغي هذا التعديل بعد feedback المستخدم:

| ما كان مقترحاً (ملغى) | الحالة الحالية |
| --------------------- | -------------- |
| hero 132px | hero 220–320px |
| أفاتار 34px | أفاتار 42px |
| prop `compact` | **غير موجود** |
| إخفاء stat labels على كل المقاسات | labels مخفية **موبايل فقط** |

### تراجع git restore — **استُعيد**

حدث `git restore` بالخطأ على كل الملفات؛ أُعيد بناء الحالة من transcript المحادثة (بدون compact pass).

### تحسين المسافات (مستقبلي)

المستخدم طلب تحسين **استغلال المسافات** (padding/gaps) **بدون** تصغير العناصر — لم يُنفَّذ بعد.

---

## 10. اختبار يدوي

- [ ] الخلاصة: بطاقة بصورة — عنوان واضح **تحت** الصورة
- [ ] الخلاصة: بطاقة **بدون** صورة — fallback نصي بدون صندوق فارغ ضخم
- [ ] غير المالك: 5 أزرار (اهتمام، تعليق، مشاركة، **دردشة**, اتصال)
- [ ] المالك: تمييز + إحصائيات (بدون شات/اتصال)
- [ ] تعليق → composer + focus
- [ ] reaction picker (hover + long-press)
- [ ] «مشاهدة الإعلان» → `/post/[id]`
- [ ] صفحة التفاصيل: gallery + عنوان في `detailsHead` + sidebar اتصال
- [ ] attributes grid يعرض القيم بشكل صحيح RTL/LTR

---

## 11. سجل التعديلات

| التاريخ | التعديل |
| ------- | ------- |
| 2026-07-06 | إطلاق listing layout (hero + stats + footer) |
| 2026-07-06 | نقل العنوان/الوصف خارج الصورة |
| 2026-07-06 | إصلاح زر الشات؛ أزرار marketplace متساوية |
| 2026-07-06 | صفحة تفاصيل: `detailsHead` + gallery + contact sidebar |
| 2026-07-06 | ~~compact density~~ — **ملغى** |
| 2026-07-06 | استعادة من git restore + توثيق هذا الملف |

---

## مراجع

- [`14-featured-posts-promotion.md`](./14-featured-posts-promotion.md) — زر «تمييز» + PayPal
- [`10-changelog.md`](./10-changelog.md) — سجل مختصر
