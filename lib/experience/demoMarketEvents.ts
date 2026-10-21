export type MarketEventKind = 'demand' | 'auction' | 'sold' | 'match' | 'nearby' | 'drop' | 'hot'

export type DemoMarketEvent = {
  id: string
  kind: MarketEventKind
  textAr: string
  textEn: string
  ctaAr: string
  ctaEn: string
  cityAr: string
  categoryAr: string
  priority: number
  source: 'demo'
  href: string
  /** ISO time used only as a sample stamp. Not a server event time. */
  sampleAt: string
}

/**
 * Future contract: GET /api/market/events?country=
 * { id, kind, text, city, category, listingId?, priority, source: 'live'|'demo', expiresAt }
 * Dismissal and saves are viewer preferences, not market facts.
 */
export function demoMarketEvents(locale: string): DemoMarketEvent[] {
  const prefix = `/${locale}`
  return [
    {
      id: 'toyota-demand',
      kind: 'demand',
      textAr: '٢٣ مشترياً يبحثون عن تويوتا في عمّان',
      textEn: '23 buyers looking for a Toyota in Amman',
      ctaAr: 'ابحث',
      ctaEn: 'Search',
      cityAr: 'عمّان',
      categoryAr: 'سيارات',
      priority: 2,
      source: 'demo',
      href: `${prefix}/search?q=${encodeURIComponent(locale === 'ar' ? 'تويوتا' : 'toyota')}`,
      sampleAt: '2026-10-21T09:10:00+03:00',
    },
    {
      id: 'price-drop',
      kind: 'drop',
      textAr: 'انخفض سعر سيارة في عيّنة المتابعة',
      textEn: 'A sample watched car dropped in price',
      ctaAr: 'العينة',
      ctaEn: 'Sample',
      cityAr: 'عمّان',
      categoryAr: 'سيارات',
      priority: 3,
      source: 'demo',
      href: `${prefix}/search?q=${encodeURIComponent(locale === 'ar' ? 'سيارات' : 'cars')}`,
      sampleAt: '2026-10-21T09:24:00+03:00',
    },
    {
      id: 'crv-auction',
      kind: 'auction',
      textAr: 'مزاد جديد على هوندا CR-V',
      textEn: 'A new auction on a Honda CR-V',
      ctaAr: 'المزادات',
      ctaEn: 'Auctions',
      cityAr: 'عمّان',
      categoryAr: 'سيارات',
      priority: 2,
      source: 'demo',
      href: `${prefix}/pages/auction`,
      sampleAt: '2026-10-21T09:40:00+03:00',
    },
    {
      id: 'hot-deal',
      kind: 'hot',
      textAr: 'عرض حار في مختبر التجربة',
      textEn: 'A hot deal inside the experience lab',
      ctaAr: 'افهم',
      ctaEn: 'See why',
      cityAr: 'عمّان',
      categoryAr: 'عام',
      priority: 4,
      source: 'demo',
      href: `${prefix}/search`,
      sampleAt: '2026-10-21T10:05:00+03:00',
    },
    {
      id: 'rent',
      kind: 'nearby',
      textAr: 'ارتفع الطلب على شقق الإيجار',
      textEn: 'Demand rose for rental apartments',
      ctaAr: 'ابحث',
      ctaEn: 'Search',
      cityAr: 'عمّان',
      categoryAr: 'عقارات',
      priority: 3,
      source: 'demo',
      href: `${prefix}/search?q=${encodeURIComponent(locale === 'ar' ? 'شقق للإيجار' : 'apartments for rent')}`,
      sampleAt: '2026-10-21T10:20:00+03:00',
    },
    {
      id: 'sold-today',
      kind: 'sold',
      textAr: '١٢٨ إعلاناً بيعت اليوم',
      textEn: '128 listings sold today',
      ctaAr: 'النبض',
      ctaEn: 'Pulse',
      cityAr: 'الأردن',
      categoryAr: 'عام',
      priority: 5,
      source: 'demo',
      href: `${prefix}/market-pulse`,
      sampleAt: '2026-10-21T10:30:00+03:00',
    },
  ]
}
