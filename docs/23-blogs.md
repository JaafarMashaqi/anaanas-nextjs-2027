# المدونة (Blogs)

## المسارات

| السياق | القائمة | تصنيف | مقال |
| ------ | ------- | ----- | ---- |
| نطاق الدولة | `/{locale}/blogs` | `/{locale}/blogs/cat/{slug}` | `/{locale}/blogs/{slug}` |
| `blogs.{base}` | `/{locale}` | `/{locale}/cat/{slug}` | `/{locale}/{slug}` |

على `blogs.localhost:3000/ar` — بدون `/blogs` وبدون تحويل لاختيار الدولة.

## الملفات

| الملف | الدور |
| ----- | ----- |
| `app/[locale]/(pages)/blogs/...` | صفحات القائمة/التصنيف/التفاصيل |
| `lib/blogs/paths.ts` | بناء الروابط حسب الهوست |
| `lib/blogs/getIsBlogsHost.ts` | قراءة `x-blogs-host` |
| `middleware.ts` | rewrite/redirect لساب دومين المدونة |
| `components/blogs/BlogsLayout.tsx` | محتوى المدونة بدون SideBar (Card + tabs) |
| `components/blogs/BlogListPanel.tsx` | بطاقة القائمة + تبويبات التصنيف |
| `app/[locale]/layout.tsx` | هيدر الموقع على كل الهوستات؛ بدون banner الإعلانات على `blogs.*` |

## SEO / SSR

- `buildBlogPageMetadata()` — canonical مطلق من `Host` الحالي (يدعم `blogs.*`)، `hreflang` ar/en، OpenGraph + Twitter
- صفحة المقال: JSON-LD `BlogPosting` + `<article>` للمحتوى
- `sitemap-blogs.xml` — قائمة + فئات + مقالات
- القائمة API: `BlogListResource` بدون `content` (أخف لـ SSR)
- `seo_description` ي fallback إلى `excerpt` في الـ API

- قائمة: `Card` + `Nav tabs` (مرجع Social-Next Events/Groups) + شبكة `Col sm={6} xl={4}`
- تفاصيل: `Card` 8/4 + سايدبار مقالات ذات صلة
- على كل الهوستات: `ResponsiveTopHeader` (شعار + دخول/خروج) بدون `SideBar`
- محتوى المدونة: Card + Nav tabs (مرجع Events/Groups) بدون `FeedLayoutClient`

## البذرة (Backend)

```bash
php artisan db:seed --class=BlogSeeder
```
