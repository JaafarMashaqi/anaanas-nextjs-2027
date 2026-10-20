export type MarketEventKind = 'demand' | 'auction' | 'sold' | 'match' | 'nearby'

export type DemoMarketEvent = {
  id: string
  kind: MarketEventKind
  textAr: string
  textEn: string
  source: 'demo'
  href: string
}

export function demoMarketEvents(locale: string): DemoMarketEvent[] {
  const prefix = `/${locale}`
  return [
    {
      id: 'toyota-demand',
      kind: 'demand',
      textAr: '٢٣ مشترياً يبحثون عن تويوتا في عمّان',
      textEn: '23 buyers looking for a Toyota in Amman',
      source: 'demo',
      href: `${prefix}/search?q=${encodeURIComponent(locale === 'ar' ? 'تويوتا' : 'toyota')}`,
    },
    {
      id: 'crv-auction',
      kind: 'auction',
      textAr: 'مزاد جديد على هوندا CR-V',
      textEn: 'A new auction on a Honda CR-V',
      source: 'demo',
      href: `${prefix}/pages/auction`,
    },
    {
      id: 'matches',
      kind: 'match',
      textAr: '١٢ فرصة تناسب اهتماماً تجريبياً',
      textEn: '12 opportunities for a sample interest',
      source: 'demo',
      href: `${prefix}/search`,
    },
    {
      id: 'rent',
      kind: 'nearby',
      textAr: 'ارتفع الطلب على شقق الإيجار',
      textEn: 'Demand rose for rental apartments',
      source: 'demo',
      href: `${prefix}/search?q=${encodeURIComponent(locale === 'ar' ? 'شقق للإيجار' : 'apartments for rent')}`,
    },
    {
      id: 'sold-today',
      kind: 'sold',
      textAr: '١٢٨ إعلاناً بيعت اليوم',
      textEn: '128 listings sold today',
      source: 'demo',
      href: `${prefix}/market-pulse`,
    },
  ]
}
