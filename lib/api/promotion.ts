import { getApiUrl } from './config'

export type PromotionPackage = {
  id: number
  slug: string
  name: string
  name_ar: string
  name_en: string
  price_per_day_usd: number
  appearance_weight: number
  features: Record<string, boolean>
  feature_labels: string[]
}

export type PromotionSummary = {
  id?: number
  status?: string
  is_active?: boolean
  starts_at?: string
  ends_at?: string
  appearance_weight?: number
  features?: Record<string, boolean>
  package?: { id: number; slug: string; name: string } | null
}

export async function fetchPromotionPackages(locale: string): Promise<PromotionPackage[]> {
  const res = await fetch(`/api/promotion/packages?land=${encodeURIComponent(locale)}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) return []
  const json = (await res.json()) as { success?: boolean; data?: PromotionPackage[] }
  return json?.success && Array.isArray(json.data) ? json.data : []
}

export async function quotePromotion(
  accessToken: string,
  payload: { post_id: number; package_id: number; days: number },
): Promise<{ total_usd: number; unit_price_usd: number; currency: string } | null> {
  const res = await fetch('/api/promotion/quote', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return null
  const json = (await res.json()) as { success?: boolean; data?: { total_usd: number; unit_price_usd: number; currency: string } }
  return json?.success ? json.data ?? null : null
}

export async function checkoutPromotion(
  accessToken: string,
  payload: {
    post_id: number
    package_id: number
    days: number
    return_url: string
    cancel_url: string
    locale: string
  },
): Promise<{ approval_url: string; order_id: number; total_usd: number } | null> {
  const res = await fetch('/api/promotion/checkout', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) return null
  const json = (await res.json()) as {
    success?: boolean
    data?: { approval_url: string; order_id: number; total_usd: number }
  }
  return json?.success ? json.data ?? null : null
}

export async function fetchFeaturedPosts(countryId?: number, locale = 'ar', limit = 8) {
  const qs = new URLSearchParams({ land: locale, limit: String(limit) })
  if (countryId) qs.set('country_id', String(countryId))
  const res = await fetch(getApiUrl(`/api/home/featured-posts?${qs}`), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  })
  if (!res.ok) return []
  const json = (await res.json()) as { success?: boolean; data?: unknown[] }
  return json?.success && Array.isArray(json.data) ? json.data : []
}

export async function fetchPromotionPopup(params: {
  countryId?: number
  clientId: string
  locale?: string
}) {
  const qs = new URLSearchParams()
  if (params.countryId) qs.set('country_id', String(params.countryId))
  if (params.clientId) qs.set('client_id', params.clientId)
  if (params.locale) qs.set('land', params.locale)
  const res = await fetch(`/api/promotion/popup?${qs}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = (await res.json()) as { success?: boolean; data?: { post: Record<string, unknown>; promotion_id?: number } | null }
  return json?.success ? json.data ?? null : null
}

export async function trackPromotionPopupClick(postId: number, promotionId?: number) {
  await fetch('/api/promotion/popup/click', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id: postId, promotion_id: promotionId }),
  }).catch(() => undefined)
}
