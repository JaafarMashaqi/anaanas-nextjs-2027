import { cache } from 'react'

import type { SectionMomentumItem } from '@/lib/api/homeInsights'
import { getApiUrl } from '@/lib/api/config'
import type { MarketPulseSource } from '@/lib/market/buildMarketPulse'

const REVALIDATE_SEC = 120

async function readTotal(path: string): Promise<{ total: number | null; error: boolean }> {
  try {
    const res = await fetch(getApiUrl(path), { next: { revalidate: REVALIDATE_SEC } })
    if (!res.ok) return { total: null, error: true }
    const json = (await res.json()) as { total?: unknown }
    const total = Number(json?.total)
    if (!Number.isFinite(total) || total < 0) return { total: null, error: true }
    return { total, error: false }
  } catch {
    return { total: null, error: true }
  }
}

async function readMomentum(path: string): Promise<{ items: SectionMomentumItem[]; error: boolean }> {
  try {
    const res = await fetch(getApiUrl(path), { next: { revalidate: REVALIDATE_SEC } })
    if (!res.ok) return { items: [], error: true }
    const json = (await res.json()) as { data?: SectionMomentumItem[] }
    if (!Array.isArray(json?.data)) return { items: [], error: true }
    return { items: json.data, error: false }
  } catch {
    return { items: [], error: true }
  }
}

export type MarketPulseQuery = {
  countryId?: number
  land: string
  cityId?: number
  sectionSlug?: string
}

/** Real counts only. Momentum stays country-level because that endpoint has no city filter. */
export const loadMarketPulseSource = cache(async (query: MarketPulseQuery): Promise<MarketPulseSource> => {
  const country = query.countryId ? `country_id=${encodeURIComponent(String(query.countryId))}&` : ''
  const city = query.cityId ? `city_id=${encodeURIComponent(String(query.cityId))}&` : ''
  const section = query.sectionSlug ? `section_slug=${encodeURIComponent(query.sectionSlug)}&` : ''
  const land = `land=${encodeURIComponent(query.land)}`

  const [listings, auctions, momentum] = await Promise.all([
    readTotal(`/api/posts?${country}${city}${section}${land}&per_page=1`),
    readTotal(`/api/auctions?${country}${city}${land}&status=live&per_page=1`),
    readMomentum(`/api/home/section-momentum?${country}${land}`),
  ])

  return {
    listingsTotal: listings.total,
    listingsError: listings.error,
    auctionsTotal: auctions.total,
    auctionsError: auctions.error,
    sections: momentum.items,
    sectionsError: momentum.error,
  }
})
