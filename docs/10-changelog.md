# 10 — سجل التغييرات (Changelog)

ترتيب زمني تقريبي لكل ما عُمل في هذه الجلسة.

## الإبلاغ عن الإعلانات — 2026-09-01

توثيق: [`19-report-post.md`](./19-report-post.md) · Backend [`17-post-reports.md`](../../anaanasBackend/docs/17-post-reports.md)

| النطاق | الملف | التغيير |
|--------|------|---------|
| UI | `PostCard.tsx` + `PostReportDialog` | خيار إبلاغ في ActionMenu + حوار الأسباب |
| BFF | `app/api/posts/[postId]/report` + `platform/public-settings` | وكلاء Laravel |
| Backend | `post_reports`, `PostReportService`, Filament, إعدادات المنصة | بلاغات + عتبة إيقاف + بريد |
| i18n | `lib/translations.ts` | `post.report.*` |

## Frontend

| النطاق             | الملف                                                                      | التغيير                                                                                              |
| ------------------ | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Layout / Page      | `app/[locale]/(pages)/page.tsx`                                            | نقل `CreatePostCardLazyClient` قبل صف الموبايل + تنظيف تعليقات JSX                                  |
| Header             | `components/layout/TopHeader/ResponsiveTopHeader.tsx`                      | إنشاء جديد — تبديل ديسكتوب/موبايل                                                                   |
| Header             | `components/layout/TopHeader/mobile/MobileTopHeader.tsx` (+ CSS)           | شعار 80×34، شريط بحث، إشعارات، رسائل                                                                |
| Header             | `components/layout/TopHeader/mobile/MobileNotificationsButton.tsx`         | نفس منطق `NotificationsBell`                                                                         |
| Header             | `components/layout/TopHeader/mobile/MobileMessagesButton.tsx`              | عداد غير المقروء من `ChatContext`                                                                    |
| Header             | `components/layout/TopHeader/mobile/MobileHeaderSearchBar.tsx`             | حقل البحث + أفاتار + ميكروفون + مسح                                                                 |
| Daily Updates      | `components/layout/ResponsiveDailyUpdatesBanner.tsx`                       | يفصل ديسكتوب/موبايل                                                                                  |
| Daily Updates      | `components/layout/mobile/MobileDailyUpdatesBanner.tsx` (+ CSS)            | Quick actions مقصورة على `28775`                                                                     |
| Sections           | `app/[locale]/(pages)/home/components/MobileSectionsSwiper.tsx` (+ CSS)    | شبكة 4×2 + مودال "عرض الكل"، إلغاء padding عام للسكشن                                                |
| AI Dashboard       | `app/[locale]/(pages)/home/components/MobileAIDashboard.tsx`               | إعادة بناء كامل: SVGs، motion variants، Stagger، useReducedMotion                                   |
| AI Dashboard CSS   | `app/[locale]/(pages)/home/components/MobileAIDashboard.module.css`        | ثيم أناناس، شبكة 2×3 مدمجة، طبقات أنيميشن لانهائية، Hover قوي                                       |
| Promo Grid         | `app/[locale]/(pages)/home/components/MobileAiPromoGrid.tsx`               | 2+1 layout، استبدال صورة الأناناس بـ `SmartAdsAiIcon` SVG                                            |
| Promo Grid CSS     | `app/[locale]/(pages)/home/components/MobileAiPromoGrid.module.css`        | ضبط مسافات، تنظيف `.bottomRow → .bottomStack/.bottomPair`، إصلاح تعارض sparkle + transform           |
| Discovery row CSS  | `app/[locale]/(pages)/homeDiscovery.module.css`                            | margins + غلاف لمنع padding من `_reboot`                                                            |
| Docs               | `docs/*`                                                                   | إنشاء توثيق متعدد الملفات (هذا الملف)                                                                |

## تمييز الإعلانات المدفوع (PayPal) — 2026-07-05/06

توثيق شامل في [`14-featured-posts-promotion.md`](./14-featured-posts-promotion.md).

| النطاق | أبرز الملفات | التغيير |
|--------|--------------|---------|
| Backend | migrations, Models, Services, PromotionController, Filament ×3, Jobs ×3 | نظام تمييز كامل + PayPal Orders v2 |
| Frontend | FeaturePostModal, FeaturedPopupAd, FeaturedPostsStrip, my-posts, statistics | UI شراء + عرض + إحصائيات |
| API BFF | `app/api/promotion/*` | proxies لـ quote/checkout/packages/popup |
| إصلاحات | Filament `$navigationGroup`, webpack/`.next`, layout popup | استقرار dev + لوحة التحكم |

## Backend

| الملف                                                                  | التغيير                                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `app/Http/Controllers/Api/v1/SectionController.php`                    | حماية `post_type` و `publish_date` بـ `Schema::hasColumn` لمنع 500       |

## Configuration

- `MOBILE_AI_PREVIEW_USER_ID = '28775'` في `page.tsx` يتحكم بظهور لوحات
  المعاينة (Dashboard / Promo Grid / Quick actions).

## لوحة إحصائيات Filament + Favicon — 2026-07-06

| النطاق | أبرز الملفات | التغيير |
|--------|--------------|---------|
| Backend | `Dashboard.php`, `DashboardStatisticsService.php`, `Filament/Widgets/*`, `custom.css`, `BackOfficeV1PanelProvider.php` | إحصائيات إعلانات/تفاعلات/مستخدمين + charts + فلاتر زمنية + ثيم لوحة كامل |
| Backend docs | `anaanasBackend/docs/15-filament-analytics-dashboard.md` | توثيق شامل للميزة والثيم وإصلاح Sidebar |
| Frontend | `app/layout.tsx`, `global.d.ts`, `app/favicon.ico`, حذف `app/icon.png` | favicon من `assets/` + `public/` |
| Frontend docs | `docs/15-favicon-setup.md` | توثيق إعداد الأيقونة |

## صفحة البحث — إعادة التصميم — 2026-07-06

| النطاق | الملفات | التغيير |
|--------|---------|---------|
| Frontend | `app/[locale]/search/SearchClient.tsx`, `searchPage.module.css` | ثيم Ananas، mesh/orbs، motion، summary card، skeleton ذهبي |
| Frontend docs | `docs/16-search-page-redesign.md` | توثيق UI + QA + ما لم يتغيّر |

## PostCard Listing UI — 2026-07-06

توثيق شامل في [`16-post-card-listing-ui.md`](./16-post-card-listing-ui.md).

| النطاق | أبرز الملفات | التغيير |
|--------|--------------|---------|
| Listing feed | `PostCard.tsx`, `PostCard.module.css` | hero نظيف، `listingInfoBlock`، stats، تخطيط عمودي |
| Actions | `PostActions.tsx`, `.module.css` | `layout=marketplace`، استرجاع الشات، أزرار flex متساوية |
| Details page | `post/[id]/page.tsx`, `postDetails.module.css` | `detailsHead`، gallery، sidebar اتصال، attributes grid |
| Gallery | `PostImagesGallery.tsx`, `.module.css` | `variant="details"` |

## My Posts Dashboard — 2026-07-06

توثيق شامل في [`17-my-posts-ui.md`](./17-my-posts-ui.md).

| النطاق | أبرز الملفات | التغيير |
|--------|--------------|---------|
| Dashboard UI | `MyPostsClient.tsx`, `myPosts.module.css` | hero mesh، stat cards، filters، Motion |
| List item | `MyPostListItem.tsx` | بطاقة مضغوطة + إجراءات + حذف |
| Layout | `layout.tsx`, `page.tsx` | skeleton + عرض أوسع |

## Statistics Dashboard — 2026-07-06

توثيق شامل في [`18-statistics-ui.md`](./18-statistics-ui.md).

| النطاق | أبرز الملفات | التغيير |
|--------|--------------|---------|
| Shared UI | `components/statistics/*` | ثيم Ananas + utils + mascot |
| Profile stats | `profile/statistics/statisticsClient.tsx` | KPIs موسّعة + 6 tabs + top posts |
| Post stats | `post/[id]/statistics/statisticsClient.tsx` | hero mesh + mascot + تبويب تمييز + unlikes |
| Backend | `PostController.php` | `myStatistics` موسّع + إصلاح `promotion_totals` mapping |
