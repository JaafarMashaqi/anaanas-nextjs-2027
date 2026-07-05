# 10 — سجل التغييرات (Changelog)

ترتيب زمني تقريبي لكل ما عُمل في هذه الجلسة.

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
