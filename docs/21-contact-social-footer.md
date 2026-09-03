# روابط التواصل في التذييل

روابط السوشيال والهاتف/واتساب تُدار من لوحة التحكم وتُجلب مرة واحدة على مستوى التطبيق.

## المكوّنات

| الملف | الدور |
| ----- | ----- |
| `context/PlatformPublicSettingsContext.tsx` | Provider + كاش + `usePlatformPublicSettings` |
| `components/layout/AuthFooterSocialLinks.tsx` | أيقونات التذييل (يُخفى الفارغ) |
| `FeedLayoutClient` + `auth/layout` | يستهلكان المكوّن المشترك |

## السلوك

- الجلب مرة واحدة عبر `/api/platform/public-settings` (كاش 5 دقائق على مستوى الموديول).
- لا يظهر `<li>` لأي منصة/رقم غير مضبوط في الإدارة.
