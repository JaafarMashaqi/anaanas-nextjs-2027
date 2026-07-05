'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from 'react-bootstrap'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

export default function PromotionPayPalCancelPage() {
  const params = useParams<{ locale?: string }>()
  const localeParam = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
  const locale: SupportedLocale = localeParam && isSupportedLocale(localeParam) ? localeParam : DEFAULT_LOCALE
  const isAr = locale === 'ar'

  return (
    <div className="container py-5 text-center" style={{ maxWidth: 520 }}>
      <h1 className="h4">{isAr ? 'تم إلغاء الدفع' : 'Payment cancelled'}</h1>
      <p className="text-secondary">{isAr ? 'لم يتم خصم أي مبلغ. يمكنك إعادة المحاولة لاحقاً.' : 'No charge was made. You can try again later.'}</p>
      <Button as={Link as any} href={`/${locale}/my-posts`} variant="warning">
        {isAr ? 'العودة إلى منشوراتي' : 'Back to my posts'}
      </Button>
    </div>
  )
}
