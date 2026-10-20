import { headers } from 'next/headers'

import MarketPulseCardClient from './MarketPulseCardClient'
import { loadMarketPulseSource } from '@/lib/api/marketPulse'
import { buildMarketPulse } from '@/lib/market/buildMarketPulse'
import { fetchLatestListings } from '@/lib/server/fetchLatestListings'
import { resolveCountryIdFromHeaders } from '@/lib/server/resolveCountryIdFromHeaders'
import { isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

export default async function MarketPulseCard({
  locale,
  variant = 'card',
}: {
  locale: SupportedLocale
  variant?: 'card' | 'rail'
}) {
  const headersList = await headers()
  const headerLocale = headersList.get('x-locale')
  const uiLocale: SupportedLocale =
    headerLocale && isSupportedLocale(headerLocale) ? headerLocale : locale

  const countryId = await resolveCountryIdFromHeaders()
  const [source, latest] = await Promise.all([
    loadMarketPulseSource({ countryId, land: uiLocale }),
    fetchLatestListings({ countryId, land: uiLocale, limit: 4 }),
  ])
  const model = buildMarketPulse(source, uiLocale)
  const generatedAt = new Date().toISOString()
  const latestItems = latest.map((item) => ({
    id: item.id,
    title: item.title,
    location: item.location,
    isNew: Boolean(item.is_new),
    href: `/${uiLocale}/post/${item.id}`,
    priceLabel:
      item.price != null && Number(item.price) > 0
        ? `${new Intl.NumberFormat(uiLocale === 'ar' ? 'ar-JO' : 'en-US', { maximumFractionDigits: 0 }).format(item.price)}${item.currency ? ` ${item.currency}` : ''}`
        : null,
  }))

  return (
    <MarketPulseCardClient
      model={model}
      locale={uiLocale}
      variant={variant}
      generatedAt={generatedAt}
      latestItems={latestItems}
    />
  )
}
