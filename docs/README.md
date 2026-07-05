# توثيق إعادة تصميم الواجهة الأمامية — Ananas

هذا المجلد يجمع كل ملفات التوثيق الخاصة بعمل إعادة تصميم الصفحة الرئيسية
على الموبايل، المكوّنات الجديدة، وإصلاحات الـ API المرتبطة بها.

## فهرس الملفات

| الملف | الموضوع |
| ----- | ------- |
| [`01-overview.md`](./01-overview.md) | نظرة عامة + ثيم العلامة + اختيارات تايبوغرافيا |
| [`02-page-layout.md`](./02-page-layout.md) | ترتيب الصفحة الرئيسية (`page.tsx`) موبايل/ديسكتوب |
| [`03-mobile-header.md`](./03-mobile-header.md) | `ResponsiveTopHeader` + `MobileTopHeader` |
| [`04-daily-updates-banner.md`](./04-daily-updates-banner.md) | `ResponsiveDailyUpdatesBanner` + Quick actions |
| [`05-mobile-sections-swiper.md`](./05-mobile-sections-swiper.md) | شبكة الأقسام 4×2 + مودال "عرض الكل" |
| [`06-mobile-ai-dashboard.md`](./06-mobile-ai-dashboard.md) | `MobileAIDashboard` بالكامل |
| [`07-mobile-ai-promo-grid.md`](./07-mobile-ai-promo-grid.md) | `MobileAiPromoGrid` (Hot deals / Auctions / Smart ads) |
| [`08-create-post-mobile-order.md`](./08-create-post-mobile-order.md) | نقل `CreatePostCardLazyClient` على الموبايل |
| [`09-api-posts-500-fix.md`](./09-api-posts-500-fix.md) | إصلاح خطأ `/api/posts` 500 (`post_type` / `publish_date`) |
| [`10-changelog.md`](./10-changelog.md) | سجل تغييرات الجلسة كاملاً |
| [`13-seo-sitemap-schema.md`](./13-seo-sitemap-schema.md) | Sitemaps + JSON-LD + robots |
| [`14-featured-posts-promotion.md`](./14-featured-posts-promotion.md) | **تمييز الإعلانات المدفوع (PayPal)** — توثيق شامل Backend + Frontend |

## كيفية القراءة

- ابدأ بـ [`01-overview.md`](./01-overview.md) للحصول على السياق العام
  والمتغيرات اللونية.
- لكل مكوّن جديد ملف مستقل يشرح: الـ props، الهيكل، الأنماط، الأنيميشن،
  الإتاحة، والتجاوب.
- ملف [`10-changelog.md`](./10-changelog.md) يقدّم نظرة سريعة بصيغة جدول
  لكل تغيير ومسار الملف.
