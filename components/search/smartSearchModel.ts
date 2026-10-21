import type { Section } from '@/lib/api/sections'
import type { SupportedLocale } from '@/lib/localization'

export type SmartSuggestionGroup = 'query' | 'recent' | 'trend' | 'section' | 'city' | 'go'

export type SmartSuggestion = {
  id: string
  group: SmartSuggestionGroup
  label: string
  hint: string
  href: string
}

const RECENT_KEY = 'ananas.smartSearch.recent'
const MAX_RECENTS = 5

export function readRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, MAX_RECENTS)
  } catch {
    return []
  }
}

export function rememberSearch(query: string) {
  if (typeof window === 'undefined') return
  const trimmed = query.trim()
  if (!trimmed) return
  const next = [trimmed, ...readRecentSearches().filter((item) => item !== trimmed)].slice(0, MAX_RECENTS)
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* storage may be blocked in private mode */
  }
}

export function clearRecentSearches() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(RECENT_KEY)
  } catch {
    /* storage may be blocked */
  }
}

export function forgetSearch(query: string) {
  if (typeof window === 'undefined') return
  const next = readRecentSearches().filter((item) => item !== query)
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* storage may be blocked */
  }
}

function searchHref(locale: string, query?: string) {
  const trimmed = query?.trim()
  if (!trimmed) return `/${locale}/search`
  return `/${locale}/search?q=${encodeURIComponent(trimmed)}`
}

export function buildSmartSuggestions(opts: {
  locale: SupportedLocale
  query: string
  sections: Section[]
  cities: Array<{ id: number; name: string }>
  recents: string[]
}): SmartSuggestion[] {
  const { locale, sections, cities, recents } = opts
  const query = opts.query.trim()
  const isArabic = locale === 'ar'
  const needle = query.toLocaleLowerCase()

  const places: SmartSuggestion[] = [
    {
      id: 'go-search',
      group: 'go',
      label: isArabic ? 'كل الإعلانات' : 'All listings',
      hint: isArabic ? 'البحث الحالي' : 'Current search',
      href: searchHref(locale),
    },
    {
      id: 'go-auction',
      group: 'go',
      label: isArabic ? 'المزادات' : 'Auctions',
      hint: isArabic ? 'صفحة المزادات' : 'Auction market',
      href: `/${locale}/pages/auction`,
    },
    {
      id: 'go-stores',
      group: 'go',
      label: isArabic ? 'المتاجر' : 'Stores',
      hint: isArabic ? 'دليل المتاجر' : 'Store directory',
      href: `/${locale}/stores`,
    },
  ]

  const sectionItems = sections
    .filter((section) => {
      if (!needle) return true
      return (
        section.name.toLocaleLowerCase().includes(needle) ||
        section.slug.toLocaleLowerCase().includes(needle)
      )
    })
    .slice(0, needle ? 5 : 4)
    .map<SmartSuggestion>((section) => ({
      id: `section-${section.id}`,
      group: 'section',
      label: section.name,
      hint: isArabic ? 'قسم' : 'Section',
      href: `/${locale}/sections/${section.slug}`,
    }))

  const cityItems = cities
    .filter((city) => !needle || city.name.toLocaleLowerCase().includes(needle))
    .slice(0, needle ? 3 : 2)
    .map<SmartSuggestion>((city) => ({
      id: `city-${city.id}`,
      group: 'city',
      label: city.name,
      hint: isArabic ? 'مدينة في البلد المختار' : 'City in the selected country',
      href: searchHref(locale, city.name),
    }))

  if (!query) {
    const recentItems = recents.slice(0, 3).map<SmartSuggestion>((item) => ({
      id: `recent-${item}`,
      group: 'recent',
      label: item,
      hint: isArabic ? 'بحث سابق على هذا الجهاز' : 'Recent on this device',
      href: searchHref(locale, item),
    }))
    const trends: SmartSuggestion[] = [
      ['كامري', 'Camry'],
      ['شقة للإيجار', 'Apartment for rent'],
      ['آيفون', 'iPhone'],
      ['وظائف', 'Jobs'],
    ].map(([ar, en]) => ({
      id: `trend-${en}`,
      group: 'trend' as const,
      label: isArabic ? ar : en,
      hint: isArabic ? 'مثال · وضع العرض' : 'Example · demo mode',
      href: searchHref(locale, isArabic ? ar : en),
    }))
    return [...recentItems, ...trends, ...sectionItems.slice(0, 3), ...cityItems.slice(0, 2), ...places.slice(0, 1)]
  }

  const typed: SmartSuggestion = {
    id: 'query',
    group: 'query',
    label: query,
    hint: isArabic ? 'ابحث في الإعلانات' : 'Search listings',
    href: searchHref(locale, query),
  }

  const matchedPlaces = places.filter((place) => place.label.toLocaleLowerCase().includes(needle))
  return [typed, ...sectionItems, ...cityItems, ...matchedPlaces]
}
