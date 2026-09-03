# صفحات CMS الديناميكية

المسار العام: `/[locale]/p/[slug]` — يعمل لأي slug من لوحة التحكم.

## الملفات

| الملف | الدور |
| ----- | ----- |
| `app/[locale]/(pages)/p/[slug]/page.tsx` | صفحة المحتوى + SEO |
| `…/cmsPage.module.css` | شريط علوي + بطل + بطاقة المحتوى |
| `lib/api/cmsPages.ts` | `fetchCmsPage` / `fetchCmsPages` |
| `auth/layout.tsx` | روابط الشروط والخصوصية |

## ملاحظات التصميم

- يعتمد على `ResponsiveTopHeader` من `[locale]/layout`
- شريط فتات خبز تحت الهيدر + منطقة عنوان جذابة
- المحتوى HTML من المحرر مع أنماط `.prose`
- قائمة «صفحات أخرى» من نفس الـ API
