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
| [`15-favicon-setup.md`](./15-favicon-setup.md) | **Favicon** — `assets/` + `public/` + `metadata.icons` في `layout.tsx` |
| [`16-search-page-redesign.md`](./16-search-page-redesign.md) | **صفحة البحث** — ثيم Ananas + motion + فلاتر (UI فقط) |
| [`16-post-card-listing-ui.md`](./16-post-card-listing-ui.md) | **PostCard listing UI** — الخلاصة + التفاصيل + PostActions + إصلاحات |
| [`17-my-posts-ui.md`](./17-my-posts-ui.md) | **My Posts** — لوحة منشوراتي + Motion + MyPostListItem |
| [`18-statistics-ui.md`](./18-statistics-ui.md) | **الإحصائيات** — ملف شخصي + إعلان + ثيم مشترك + Backend API |
| [`19-report-post.md`](./19-report-post.md) | **الإبلاغ عن الإعلانات** — ActionMenu + عتبة 5 + Filament + إعدادات المنصة |
| [`20-edit-post-review-notice.md`](./20-edit-post-review-notice.md) | **تعديل الإعلان** — تنبيه + تأكيد قبل الإعادة للمراجعة |
| [`21-contact-social-footer.md`](./21-contact-social-footer.md) | **تذييل التواصل** — إعدادات مشتركة + إخفاء الفارغ |
| [`22-cms-pages.md`](./22-cms-pages.md) | **صفحات CMS** — `/p/[slug]` + شروط/خصوصية |
| [`23-blogs.md`](./23-blogs.md) | **المدونة** — قائمة/تفاصيل + تعليقات/إعجابات + ساب دومين `blogs` |

## كيفية القراءة

- ابدأ بـ [`01-overview.md`](./01-overview.md) للحصول على السياق العام
  والمتغيرات اللونية.
- لكل مكوّن جديد ملف مستقل يشرح: الـ props، الهيكل، الأنماط، الأنيميشن،
  الإتاحة، والتجاوب.
- ملف [`10-changelog.md`](./10-changelog.md) يقدّم نظرة سريعة بصيغة جدول
  لكل تغيير ومسار الملف.
