import type { SectionMomentumItem } from '@/lib/api/homeInsights'

export type PulseLocale = 'ar' | 'en'

export type PulseMetricId =
  | 'listings'
  | 'fresh'
  | 'activity'
  | 'wanted'
  | 'auctions'
  | 'sections'
  | 'measured'
  | 'opportunities'
  | 'sold'
  | 'commerce'

export type PulseLevel = 'live' | 'demo' | 'blocked'

export type PulseMetric = {
  id: PulseMetricId
  level: PulseLevel
  label: string
  value: string
  period: string
  hint: string
  tone: 'navy' | 'amber' | 'violet' | 'green' | 'coral' | 'blue'
  href: string
  sectionSlug?: string
  raw: number | null
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

function hrefFor(locale: string, metric: 'listings' | 'auctions' | 'sections' | 'measured', sectionSlug?: string): string {
  const params = new URLSearchParams({ metric })
  if (sectionSlug) params.set('section', sectionSlug)
  return `/${locale}/market-pulse?${params.toString()}`
}

export function buildMarketPulse(source: MarketPulseSource, locale: PulseLocale): MarketPulseModel {
  const ar = locale === 'ar'
  const metrics: PulseMetric[] = [
    {
      id: 'listings',
      label: ar ? 'منشورة' : 'Published',
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
      level: 'live',
      href: hrefFor(locale, 'listings'),
      raw: source.listingsError ? null : source.listingsTotal,
    },
    {
      id: 'auctions',
      label: ar ? 'مزادات' : 'Auctions',
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
      level: 'live',
      href: hrefFor(locale, 'auctions'),
      raw: source.auctionsError ? null : source.auctionsTotal,
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
      level: 'live',
      href: hrefFor(locale, 'sections'),
      raw: source.sections.length,
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
      level: 'live',
      href: hrefFor(locale, 'measured', measured.slug),
      sectionSlug: measured.slug,
      raw: measured.current_count,
    })
  }

  const activeSections = source.sections.filter((item) => item.current_count > 0).length
  metrics.splice(1, 0, {
    id: 'fresh',
    level: 'demo',
    label: ar ? 'جديدة' : 'New',
    value: ar ? 'تجريبي' : 'Demo',
    period: ar ? 'لا نافذة ٢٤ ساعة' : 'No 24-hour window',
    hint: ar
      ? 'لا يوجد إجمالي للإعلانات الجديدة. اللوحة واجهة تجريبية، وشارة is_new ليست هذا الإجمالي.'
      : 'There is no total of new listings. The panel is a demo, and is_new is not that total.',
    tone: 'blue',
    href: `/${locale}/search`,
    raw: null,
  })
  metrics.splice(2, 0, {
    id: 'activity',
    level: 'live',
    label: ar ? 'الأقسام' : 'Sections',
    value: count(source.sectionsError ? null : activeSections, locale, source.sectionsError),
    period: ar ? 'أقسام بعدد أكبر من صفر' : 'Sections with a count above zero',
    hint: ar
      ? 'من section-momentum. ليس نشاط السوق لحظة بلحظة.'
      : 'From section-momentum. Not a live tick of the whole market.',
    tone: 'coral',
    href: hrefFor(locale, 'sections'),
    raw: source.sectionsError ? null : activeSections,
  })
  metrics.splice(3, 0, {
    id: 'wanted',
    level: 'demo',
    label: ar ? 'مطلوب' : 'Wanted',
    value: ar ? 'تجريبي' : 'Demo',
    period: ar ? 'لا نوع مطلوب' : 'No wanted type',
    hint: ar
      ? 'لا عدّاد طلب. الفتح يعرض لوحة تجريبية ولا ينشر إعلاناً.'
      : 'No demand count. Opening this shows a demo panel and publishes nothing.',
    tone: 'violet',
    href: `/${locale}`,
    raw: null,
  })
  metrics.push(
    {
      id: 'opportunities',
      level: 'demo',
      label: ar ? 'فرص' : 'Opportunities',
      value: ar ? 'تجريبي' : 'Demo',
      period: ar ? 'لا مطابقة للمستخدم' : 'No user matching',
      hint: ar
        ? 'لا قائمة فرص شخصية. اللوحة شكل للواجهة فقط.'
        : 'There is no personal opportunity list. The panel is an interface sketch only.',
      tone: 'violet',
      href: `/${locale}/search`,
      raw: null,
    },
    {
      id: 'commerce',
      level: 'blocked',
      label: ar ? 'بث' : 'Live',
      value: ar ? 'لا بث' : 'No live',
      period: ar ? 'لا جلسات بيع' : 'No selling sessions',
      hint: ar
        ? 'لا يوجد مسار بث أو تجارة مباشرة. هذه حالة غير متاحة وليست مشاهدين.'
        : 'There is no live-session route. This is unavailable, not a viewer count.',
      tone: 'coral',
      href: `/${locale}/search`,
      raw: null,
    },
    {
      id: 'sold',
      level: 'blocked',
      label: ar ? 'مباع' : 'Sold',
      value: ar ? 'غير مؤكد' : 'Unconfirmed',
      period: ar ? 'بانتظار حدث بيع' : 'Waiting for a sale event',
      hint: ar
        ? 'لا نعرض عدداً. الخادم لا يعيد بيعاً مؤكداً.'
        : 'No number is shown. The server does not return a confirmed sale.',
      tone: 'green',
      href: `/${locale}/market-pulse`,
      raw: null,
    },
  )

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
      id: 'commerce',
      label: ar ? 'تجارة مباشرة' : 'Live commerce',
      reason: ar ? 'لا توجد جلسات بث أو متجر على الهواء.' : 'No live sessions or on-air store are returned.',
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

export type PulseActivity = {
  id: string
  text: string
  href: string
  kind: 'window' | 'change' | 'listing'
}

/** Real events only. No “may suit you” lines and no invented viewers. */
export function buildPulseActivity(
  sections: SectionMomentumItem[],
  latest: Array<{ id: number; title: string; isNew: boolean; href: string }>,
  locale: PulseLocale,
): PulseActivity[] {
  const ar = locale === 'ar'
  const events: PulseActivity[] = []

  for (const item of sections) {
    if (item.previous_count > 0 && Number.isFinite(item.growth_percent)) {
      const change = growthLabel(item)
      events.push({
        id: `change-${item.section_id}`,
        kind: 'change',
        href: hrefFor(locale, 'measured', item.slug),
        text: ar
          ? `${item.name}: ${item.current_count} الآن مقابل ${item.previous_count} في النافذة السابقة${change ? ` (${change})` : ''}`
          : `${item.name}: ${item.current_count} now versus ${item.previous_count} in the previous window${change ? ` (${change})` : ''}`,
      })
    } else if (item.current_count > 0) {
      events.push({
        id: `window-${item.section_id}`,
        kind: 'window',
        href: hrefFor(locale, 'measured', item.slug),
        text: ar
          ? `حركة في ${item.name}: ${item.current_count} ضمن نافذة الخادم، بلا نافذة سابقة`
          : `Movement in ${item.name}: ${item.current_count} in the server window, with no previous window`,
      })
    }
  }

  for (const item of latest) {
    if (!item.isNew) continue
    events.push({
      id: `listing-${item.id}`,
      kind: 'listing',
      href: item.href,
      text: ar ? `إعلان يحمل شارة جديد: ${item.title}` : `Listing flagged new: ${item.title}`,
    })
  }

  return events.slice(0, 6)
}
