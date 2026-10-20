import 'server-only'

import { cache } from 'react'

import { fetchCountries, type Country } from '@/lib/api/countries'

/** One country catalog per request, from `/api/countries`. */
export const getCountriesCached = cache(async (): Promise<Country[]> => {
  return fetchCountries({ revalidateSeconds: 600 })
})
