# 15 — إعداد Favicon (أيقونة المتصفح)

**التاريخ:** 2026-07-06

---

## الهدف

توحيد **favicon** المنصة ليعرض أيقونة Ananas (الأناناس) في تبويب المتصفح
ومشاركات الرابط، باستخدام ملف `.ico` واحد من مصدرين متطابقين.

---

## ملفات الأيقونة

| المسار | الدور |
| ------ | ----- |
| `assets/favicon.ico` | **المصدر** — يُستورد في `layout.tsx` للـ metadata |
| `public/favicon.ico` | **الخدمة العامة** — متاح على `/favicon.ico` |
| `app/favicon.ico` | **اتفاقية Next.js** — file-based metadata |

> الملفات الثلاثة متطابقة (نفس الـ hash). عند التحديث: عدّل `assets/favicon.ico`
> ثم انسخ إلى `public/` و `app/`.

---

## التغييرات في `app/layout.tsx`

### الاستيراد

```tsx
import faviconIco from '@/assets/favicon.ico'
```

### metadata.icons

```tsx
export const metadata: Metadata = {
  // ...
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      {
        url: typeof faviconIco === 'string' ? faviconIco : faviconIco.src,
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}
```

- **`/favicon.ico`** — من مجلد `public/`
- **`faviconIco.src`** — نسخة مُجمّعة عبر webpack من `assets/`

---

## TypeScript — `global.d.ts`

```typescript
declare module '*.ico' {
  const content: import('next/image').StaticImageData
  export default content
}
```

---

## إزالة التعارض

| الإجراء | السبب |
| ------- | ----- |
| حذف `app/icon.png` | كان يولّد `<link rel="icon">` مختلفاً (شعار كامل على خلفية سوداء) ويتجاوز favicon.ico |

---

## تحديث الأيقونة مستقبلاً

1. استبدل `assets/favicon.ico`
2. انسخ إلى:
   ```bash
   cp assets/favicon.ico public/favicon.ico
   cp assets/favicon.ico app/favicon.ico
   ```
3. Hard refresh في المتصفح (Ctrl+F5) — المتصفحات ت cache الـ favicon بقوة

---

## Middleware

`middleware.ts` يستثني `/favicon` من معالجة الـ locale — لا حاجة لتعديل إضافي.

```typescript
matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"]
```

---

## QA

- [ ] تبويب المتصفح يعرض أيقونة الأناناس
- [ ] `/favicon.ico` يُرجع 200
- [ ] View Page Source يحتوي `<link rel="icon" …>`
- [ ] لا يوجد `app/icon.png` قديم
