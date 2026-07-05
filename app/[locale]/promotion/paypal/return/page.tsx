'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Button, Spinner } from 'react-bootstrap'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'

export default function PromotionPayPalReturnPage() {
  const params = useParams<{ locale?: string }>()
  const searchParams = useSearchParams()
  const localeParam = Array.isArray(params?.locale) ? params.locale[0] : params?.locale
  const locale: SupportedLocale = localeParam && isSupportedLocale(localeParam) ? localeParam : DEFAULT_LOCALE
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const [postId, setPostId] = useState<number | null>(null)

  useEffect(() => {
    const qs = searchParams.toString()
    fetch(`/api/promotion/paypal/return${qs ? `?${qs}` : ''}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok || !json?.success) {
          setState('error')
          return
        }
        setPostId(Number(json?.data?.post_id ?? 0) || null)
        setState('success')
      })
      .catch(() => setState('error'))
  }, [searchParams])

  const isAr = locale === 'ar'

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      {state === 'loading' && (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3 mb-0">{isAr ? 'جاري تأكيد الدفع...' : 'Confirming payment...'}</p>
        </div>
      )}
      {state === 'success' && (
        <div className="text-center">
          <h1 className="h4">{isAr ? 'تم تفعيل التمييز بنجاح' : 'Promotion activated'}</h1>
          <p className="text-secondary">{isAr ? 'شكراً لك. إعلانك أصبح مميزاً الآن.' : 'Thanks! Your ad is now featured.'}</p>
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            {postId ? (
              <Button as={Link as any} href={`/${locale}/post/${postId}`} variant="warning">
                {isAr ? 'عرض الإعلان' : 'View ad'}
              </Button>
            ) : null}
            <Button as={Link as any} href={`/${locale}/my-posts`} variant="light">
              {isAr ? 'منشوراتي' : 'My posts'}
            </Button>
          </div>
        </div>
      )}
      {state === 'error' && (
        <div className="text-center">
          <h1 className="h4">{isAr ? 'تعذر تأكيد الدفع' : 'Payment confirmation failed'}</h1>
          <p className="text-secondary">{isAr ? 'لم يتم تفعيل التمييز. يمكنك المحاولة مرة أخرى.' : 'Promotion was not activated. You can try again.'}</p>
          <Button as={Link as any} href={`/${locale}/my-posts`} variant="warning">
            {isAr ? 'العودة إلى منشوراتي' : 'Back to my posts'}
          </Button>
        </div>
      )}
    </div>
  )
}
