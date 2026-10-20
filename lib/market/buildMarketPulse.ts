import type { SectionMomentumItem } from '@/lib/api/homeInsights'

export type PulseLocale = 'ar' | 'en'

export type PulseMetricId = 'listings' | 'auctions' | 'sections' | 'measured'

export type PulseMetric = {
  id: PulseMetricId
  label: string
  value: string
  period: string
  hint: string
  tone: 'navy' | 'amber' | 'violet' | 'green'
  href: string
  sectionSlug?: string
}

export type PulseSectionBar = {
  sectionId: number
  slug: string
  name: string
  current: number
  previous: number
  /** Null when the previous window is empty. Never a synthetic +100%. */
  growthLabel: string | null
  href: string
}

export type UnavailableMetric = {
  id: string
  label: string
  reason: string
}

export type MarketPulseSource = {
  listingsTotal: number | null
  listingsError: boolean
  auctionsTotal: number | null
  auctionsError: boolean
  sections: SectionMomentumItem[]
  sectionsError: boolean
}

export type MarketPulseModel = {
  metrics: PulseMetric[]
  bars: PulseSectionBar[]
  unavailable: UnavailableMetric[]
  insight: string | null
}

function count(value: number | null, locale: PulseLocale, error: boolean): string {
  if (error || value == null) return locale === 'ar' ? 'غير متاح' : 'Unavailable'
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-US', { maximumFractionDigits: 0 }).format(value)
}

function growthLabel(item: SectionMomentumItem): string | null {
  if (!item.previous_count || item.previous_count <= 0) return null
  const rounded = Math.round(item.growth_percent)
  if (!Number.isFinite(rounded)) return null
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

function hrefFor(locale: string, metric: PulseMetricId, sectionSlug?: string): string {
  const params = new URLSearchParams({ metric })
  if (sectionSlug) params.set('section', sectionSlug)
  return `/${locale}/market-pulse?${params.toString()}`
}

export function buildMarketPulse(source: MarketPulseSource, locale: PulseLocale): MarketPulseModel {
  const ar = locale === 'ar'
  const metrics: PulseMetric[] = [
    {
      id: 'listings',
      label: ar ? 'إعلانات منشورة' : 'Published listings',
      value: count(source.listingsTotal, locale, source.listingsError),
      period: ar ? 'كل الإعلانات النشطة' : 'All active listings',
      hint: source.listingsError
        ? ar
          ? 'تعذر قراءة العدد من /api/posts.'
          : 'Could not read the count from /api/posts.'
        : ar
          ? 'المجموع من الخادم لهذا البلد. ليس عدد إعلانات اليوم.'
          : 'Server total for this country. Not a count of listings posted today.',
      tone: 'navy',
      href: hrefFor(locale, 'listings'),
    },
    {
      id: 'auctions',
      label: ar ? 'مزادات مباشرة' : 'Live auctions',
      value: count(source.auctionsTotal, locale, source.auctionsError),
      period: ar ? 'الحالة الآن' : 'Right now',
      hint: source.auctionsError
        ? ar
          ? 'تعذر قراءة /api/auctions.'
          : 'Could not read /api/auctions.'
        : ar
          ? 'عدد المزادات ذات الحالة live. الصفر رقم حقيقي وليس تقديراً.'
          : 'Count of auctions with status live. Zero is a real count, not an estimate.',
      tone: 'amber',
      href: hrefFor(locale, 'auctions'),
    },
  ]

  if (!source.sectionsError) {
    metrics.push({
      id: 'sections',
      label: ar ? 'أقسام لها حركة' : 'Sections with movement',
      value: count(source.sections.length, locale, false),
      period: ar ? 'نافذة المقارنة من الخادم' : 'Server comparison window',
      hint: ar
        ? 'عدد الأقسام في section-momentum. الخادم لا يسمّي طول النافذة.'
        : 'Sections returned by section-momentum. The server does not name the window length.',
      tone: 'violet',
      href: hrefFor(locale, 'sections'),
    })
  }

  const measured = source.sections
    .filter((item) => item.previous_count > 0 && Number.isFinite(item.growth_percent))
    .sort((a, b) => b.current_count - a.current_count)[0]

  if (measured) {
    const change = growthLabel(measured)
    metrics.push({
      id: 'measured',
      label: measured.name,
      value: count(measured.current_count, locale, false),
      period: change
        ? ar
          ? `${change} عن النافذة السابقة`
          : `${change} vs the previous window`
        : ar
          ? 'مقارنة بنافذة سابقة'
          : 'Compared with a previous window',
      hint: ar
        ? `${measured.current_count} الآن، ${measured.previous_count} في النافذة السابقة. ليست توقعاً للطلب.`
        : `${measured.current_count} now, ${measured.previous_count} in the previous window. Not a demand forecast.`,
      tone: 'green',
      href: hrefFor(locale, 'measured', measured.slug),
      sectionSlug: measured.slug,
    })
  }

  const bars: PulseSectionBar[] = source.sections.map((item) => ({
    sectionId: item.section_id,
    slug: item.slug,
    name: item.name,
    current: item.current_count,
    previous: item.previous_count,
    growthLabel: growthLabel(item),
    href: hrefFor(locale, 'measured', item.slug),
  })).sort((a, b) => b.current - a.current || a.name.localeCompare(b.name))

  const unavailable: UnavailableMetric[] = [
    {
      id: 'wanted',
      label: ar ? 'طلبات مطلوب' : 'Wanted requests',
      reason: ar
        ? 'لا يوجد نوع إعلان «مطلوب» في الخادم.'
        : 'The server has no wanted listing type.',
    },
    {
      id: 'nearby',
      label: ar ? 'نشاط قريب' : 'Nearby activity',
      reason: ar
        ? 'لا يوجد فلتر موقع أدق من المدينة.'
        : 'There is no location filter finer than a city.',
    },
    {
      id: 'hot',
      label: ar ? 'صفقات ساخنة' : 'Hot deals',
      reason: ar
        ? 'لا توجد درجة طلب أو تغيّر سعر. الإعلانات المميزة قائمة ترويج وليست حرارة سوق.'
        : 'No demand score or price-change field. Featured posts are a promotion list, not market heat.',
    },
    {
      id: 'sold',
      label: ar ? 'مباع حديثاً' : 'Recently sold',
      reason: ar ? 'لا توجد أحداث بيع موثّقة.' : 'No verified sale events are returned.',
    },
    {
      id: 'matches',
      label: ar ? 'فرص مخصصة' : 'Personalized opportunities',
      reason: ar ? 'لا توجد بيانات مطابقة.' : 'No matching data is returned.',
    },
    {
      id: 'alerts',
      label: ar ? 'تنبيهات النبض' : 'Pulse alerts',
      reason: ar ? 'لا يوجد اشتراك تنبيه في الخادم.' : 'The server has no alert subscription.',
    },
    {
      id: 'demand',
      label: ar ? 'طلب مقابل عرض' : 'Demand and supply',
      reason: ar
        ? 'current_count ليس طلباً وprevious_count ليس عرضاً. لا يوجد مؤشر طلب منفصل.'
        : 'current_count is not demand and previous_count is not supply. No separate demand index exists.',
    },
    {
      id: 'history',
      label: ar ? 'سلسلة زمنية' : 'Movement over time',
      reason: ar
        ? 'الخادم يعيد نافذتين فقط، بلا أيام وبدون سلسلة أطول.'
        : 'The server returns only two windows, with no dates and no longer series.',
    },
  ]

  const insight = measured
    ? ar
      ? `${measured.name}: ${measured.current_count} في النافذة الحالية مقابل ${measured.previous_count} في السابقة. هذا وصف للعدّين، وليس توقعاً.`
      : `${measured.name}: ${measured.current_count} in the current window versus ${measured.previous_count} in the previous one. That restates the two counts. It is not a forecast.`
    : null

  return { metrics, bars, unavailable, insight }
}
