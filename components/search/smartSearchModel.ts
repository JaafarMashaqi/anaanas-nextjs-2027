import type { Section } from '@/lib/api/sections'
import type { SupportedLocale } from '@/lib/localization'

export type SmartSuggestionGroup = 'query' | 'recent' | 'section' | 'go'

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

function searchHref(locale: string, query?: string) {
  const trimmed = query?.trim()
  if (!trimmed) return `/${locale}/search`
  return `/${locale}/search?q=${encodeURIComponent(trimmed)}`
}

export function buildSmartSuggestions(opts: {
  locale: SupportedLocale
  query: string
  sections: Section[]
  recents: string[]
}): SmartSuggestion[] {
  const { locale, sections, recents } = opts
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

  if (!query) {
    const recentItems = recents.slice(0, 3).map<SmartSuggestion>((item) => ({
      id: `recent-${item}`,
      group: 'recent',
      label: item,
      hint: isArabic ? 'بحث سابق على هذا الجهاز' : 'Recent on this device',
      href: searchHref(locale, item),
    }))
    return [...recentItems, ...sectionItems.slice(0, 3), ...places.slice(0, 2)]
  }

  const typed: SmartSuggestion = {
    id: 'query',
    group: 'query',
    label: query,
    hint: isArabic ? 'ابحث في الإعلانات' : 'Search listings',
    href: searchHref(locale, query),
  }

  const matchedPlaces = places.filter((place) => place.label.toLocaleLowerCase().includes(needle))
  return [typed, ...sectionItems, ...matchedPlaces]
}
