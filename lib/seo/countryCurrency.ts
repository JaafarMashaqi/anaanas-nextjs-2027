/** ISO2 (lowercase) → ISO 4217 currency. Only map when confident. */
const COUNTRY_CURRENCY: Record<string, string> = {
  jo: 'JOD',
  eg: 'EGP',
  sa: 'SAR',
  ae: 'AED',
  kw: 'KWD',
  qa: 'QAR',
  bh: 'BHD',
  om: 'OMR',
  lb: 'LBP',
  iq: 'IQD',
  sy: 'SYP',
  ps: 'ILS',
  ye: 'YER',
  ly: 'LYD',
  tn: 'TND',
  dz: 'DZD',
  ma: 'MAD',
  sd: 'SDG',
  mr: 'MRU',
  tr: 'TRY',
}

/**
 * Laravel `/api/countries` ids. Listing payloads often send `country_id`
 * and omit the nested `country` object, so currency cannot be read from iso2.
 * Source checked 2026-10-20 against https://admin.anaanas.com/api/countries.
 */
const COUNTRY_ID_ISO2: Record<number, string> = {
  3: 'dz',
  17: 'bh',
  62: 'eg',
  103: 'iq',
  111: 'jo',
  118: 'kw',
  122: 'lb',
  125: 'ly',
  139: 'mr',
  149: 'ma',
  166: 'om',
  169: 'ps',
  179: 'qa',
  190: 'sa',
  206: 'sd',
  212: 'sy',
  221: 'tn',
  222: 'tr',
  228: 'ae',
  242: 'ye',
}

export function resolveCurrencyForCountry(iso2: string | null | undefined): string | null {
  if (!iso2) return null
  const key = iso2.trim().toLowerCase()
  return COUNTRY_CURRENCY[key] ?? null
}

export function iso2ForCountryId(countryId: unknown): string | null {
  const id = typeof countryId === 'number' ? countryId : Number(countryId)
  if (!Number.isFinite(id) || id <= 0) return null
  return COUNTRY_ID_ISO2[id] ?? null
}

export type CountryCurrencySource = {
  id: number
  iso2?: string | null
  iso_code?: string | null
}

/** Prefer the listing's own ISO, then that listing's country in the API catalog. */
export function resolveListingCurrency(input: {
  iso2?: string | null
  countryId?: unknown
  /** Countries from `/api/countries`. Never pass the viewer's selected country as a substitute. */
  countries?: CountryCurrencySource[] | null
}): string | null {
  const direct = resolveCurrencyForCountry(input.iso2)
  if (direct) return direct

  const id = typeof input.countryId === 'number' ? input.countryId : Number(input.countryId)
  if (input.countries && Number.isFinite(id) && id > 0) {
    const match = input.countries.find((country) => country.id === id)
    const fromCatalog = resolveCurrencyForCountry(match?.iso2 || match?.iso_code)
    if (fromCatalog) return fromCatalog
  }

  return resolveCurrencyForCountry(iso2ForCountryId(input.countryId))
}
