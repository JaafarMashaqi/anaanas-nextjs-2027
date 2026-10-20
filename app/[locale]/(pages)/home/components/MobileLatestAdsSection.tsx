import { headers } from 'next/headers'

import { fetchLatestListings, type LatestListingItem } from '@/lib/server/fetchLatestListings'
import { getCountryByCodeCached } from '@/lib/server/getCountryByCodeCached'
import { isSupportedLocale } from '@/lib/localization'
import type { SupportedLocale } from '@/lib/localization'

import MobileLatestAdsSectionClient from './MobileLatestAdsSectionClient'

/** Compact latest rail. Hidden nowhere: the feed excludes these ids so they are not repeated below. */
export default async function MobileLatestAdsSection({
  locale,
  items: provided,
}: {
  locale: SupportedLocale
  items?: LatestListingItem[]
}) {
  const headersList = await headers()
  const headerLocale = headersList.get('x-locale')
  const uiLocale: SupportedLocale =
    headerLocale && isSupportedLocale(headerLocale) ? headerLocale : locale

  const countryCode = headersList.get('x-country')
  let countryId: number | undefined
  if (countryCode) {
    try {
      const country = await getCountryByCodeCached(countryCode)
      countryId = country?.id
    } catch {
      countryId = undefined
    }
  }

  const items =
    provided ??
    (await fetchLatestListings({
      countryId,
      land: uiLocale,
      limit: 12,
    }))

  return <MobileLatestAdsSectionClient items={items} locale={uiLocale} />
}
