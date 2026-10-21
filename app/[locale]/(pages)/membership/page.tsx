import type { Metadata } from 'next'
import Link from 'next/link'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

export const metadata: Metadata = { title: 'Membership' }

const TIERS = [
  ['مجاني', 'Free', 'نشر الإعلان الحالي'],
  ['مميز', 'Featured', 'تمييز في الواجهة، بلا سعر'],
  ['ذهبي', 'Gold', 'أدوات ترويج للعرض'],
  ['PRO', 'PRO', 'تحليلات البائع للعرض'],
  ['نخبة', 'Elite', 'مركز الأعمال للعرض'],
]

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeRaw } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const ar = locale === 'ar'
  return (
    <main className="container py-4 mt-5" dir={ar ? 'rtl' : 'ltr'} style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{ar ? 'عضويتي' : 'Membership'}</h1>
      <p style={{ color: '#667085' }}>
        {ar
          ? 'مقارنة للواجهة فقط. لا توجد أسعار، ولا اشتراك، ولا دفع.'
          : 'An interface comparison only. There are no prices, subscriptions, or payments.'}
      </p>
      <ul style={{ padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
        {TIERS.map(([arName, enName, note]) => (
          <li key={enName} style={{ background: '#fff', border: '1px solid #e7e9ee', borderRadius: 14, padding: '0.7rem 0.9rem' }}>
            <strong>{ar ? arName : enName}</strong>
            <div style={{ color: '#667085', fontSize: '0.86rem' }}>{note}</div>
          </li>
        ))}
      </ul>
      <Link href={`/${locale}`}>{ar ? 'العودة للسوق' : 'Back to the market'}</Link>
    </main>
  )
}
