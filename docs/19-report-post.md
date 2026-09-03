# 19 — الإبلاغ عن الإعلانات (Report Post)

تاريخ: 2026-09-01  
النطاق: Frontend (`PostCard`) + Backend API + Filament (`الإشراف`) + إعدادات المنصة

## الهدف

تمكين المستخدمين (والزوار عند التفعيل) من الإبلاغ عن إعلان مع اختيار سبب، وإرسال البلاغ للوحة التحكم. عند وصول عدد البلاغات إلى حد قابل للضبط (افتراضي **5**) يُوقف نشر الإعلان ويُحوَّل إلى `pending_review` مع إشعار الإدارة في كل بلاغ.

## سلوك المنتج

| القاعدة | التفاصيل |
|--------|----------|
| قائمة ⋮ | خيار «الإبلاغ عن الإعلان» لغير المالك |
| أسباب | spam / harassment / scam / inappropriate / **other** + نص حر |
| مرة واحدة | مستخدم مسجّل: مرة لكل إعلان. زائر: مرة لكل IP لكل إعلان |
| الزوار | مفعّل من **إعدادات المنصة** (`post_report_allow_guests`) |
| الحد | `post_report_threshold` (افتراضي 5) → إيقاف + `pending_review` |
| إشعار الأدمن | بريد عبر `contact_notification_emails` لكل بلاغ (+ بريد المراجعة عند الإيقاف التلقائي) |

## Frontend — الملفات

| الملف | الدور |
|------|------|
| `components/cards/PostCard.tsx` | ActionMenu + فتح الحوار + إرسال البلاغ |
| `components/cards/PostReportDialog.tsx` (+ CSS) | واجهة اختيار السبب |
| `app/api/posts/[postId]/report/route.ts` | BFF → Laravel |
| `app/api/platform/public-settings/route.ts` | قراءة `allow_guests` / threshold |
| `lib/translations.ts` | مفاتيح `post.report.*` |

## Backend — الملفات

| الملف | الدور |
|------|------|
| `database/migrations/2026_09_01_050000_create_post_reports_table.php` | جدول `post_reports` |
| `app/Models/PostReport.php` | النموذج |
| `app/Services/PostReportService.php` | إنشاء + تفرّد + عتبة الإيقاف |
| `app/Services/PlatformSettingsService.php` | مفاتيح الإعدادات الجديدة |
| `app/Http/Controllers/Api/v1/PostReportController.php` | API |
| `app/Mail/PostReportMail.php` + `emails/post-report` | إشعار البريد |
| `app/Filament/Resources/PostReports/*` | قائمة/عرض البلاغات |
| `ManagePlatformSettings` + blade | عتبة البلاغات + السماح للزوار |

## API

```http
GET  /api/platform/public-settings
POST /api/posts/{post}/report
```

Body:

```json
{
  "category": "spam|harassment|scam|inappropriate|other",
  "reason": "string (required, max 500)",
  "description": "string (optional)"
}
```

Auth: اختياري. إن لم يوجد مستخدم و`allow_guests=false` → 401.

## Filament

- مجموعة **الإشراف** → **بلاغات الإعلانات**
- Badge بعدد البلاغات `pending`
- إجراءات: تمييز كمراجع / رفض / إيقاف الإعلان وتحويله للمراجعة / إغلاق كإجراء متخذ

## إعدادات المنصة

```
post_report_threshold = 5
post_report_allow_guests = false
```

## اختبار يدوي

- [ ] مستخدم غير المالك يبلّغ من القائمة → يظهر في Filament + بريد
- [ ] نفس المستخدم يبلّغ مرة ثانية → رفض
- [ ] زائر مع `allow_guests=false` → يطلب تسجيل الدخول
- [ ] زائر مع `allow_guests=true` → بلاغ ناجح؛ نفس IP مرة ثانية مرفوض
- [ ] الوصول للحد → حالة الإعلان `pending_review` + اختفاء من القوائم العامة
- [ ] المالك لا يرى خيار الإبلاغ

## Deploy

```bash
# Backend
php artisan migrate
php artisan config:cache

# Frontend
npm run build
```
