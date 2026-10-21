import type { Metadata } from 'next'
import Link from 'next/link'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

export const metadata: Metadata = { title: 'Saved' }

export default async function SavedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeRaw } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const ar = locale === 'ar'
  return (
    <main className="container py-4 mt-5" dir={ar ? 'rtl' : 'ltr'} style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{ar ? 'المحفوظات' : 'Saved'}</h1>
      <p style={{ color: '#667085' }}>
        {ar
          ? 'لا توجد خدمة محفوظات على الخادم بعد. الحفظ داخل الإعلان يبقى على هذا الجهاز ولا يُعرض هنا كقائمة حقيقية.'
          : 'There is no saved-listings service yet. Saving inside a listing stays on this device and is not shown here as a real list.'}
      </p>
      <Link href={`/${locale}`}>{ar ? 'العودة للسوق' : 'Back to the market'}</Link>
    </main>
  )
}
