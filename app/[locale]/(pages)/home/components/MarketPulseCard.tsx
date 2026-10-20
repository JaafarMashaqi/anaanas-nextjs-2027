import { headers } from 'next/headers'

import MarketPulseCardClient from './MarketPulseCardClient'
import { loadMarketPulseSource } from '@/lib/api/marketPulse'
import { buildMarketPulse } from '@/lib/market/buildMarketPulse'
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
  const source = await loadMarketPulseSource({ countryId, land: uiLocale })
  const model = buildMarketPulse(source, uiLocale)

  return <MarketPulseCardClient model={model} locale={uiLocale} variant={variant} />
}
