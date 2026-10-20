import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { Col } from 'react-bootstrap'
import Image from 'next/image'

import FeedLayoutClient from '@/components/layout/FeedLayoutClient'
import SideBar from '@/components/layout/SideBar'
import { fetchAuctions } from '@/lib/api/auctions'
import { fetchCitiesByCountryId } from '@/lib/api/cities'
import { fetchPosts } from '@/lib/api/posts'
import { fetchSections } from '@/lib/api/sections'
import { loadMarketPulseSource } from '@/lib/api/marketPulse'
import { buildMarketPulse } from '@/lib/market/buildMarketPulse'
import { DEFAULT_LOCALE, isSupportedLocale, type SupportedLocale } from '@/lib/localization'
import { resolveListingCurrency } from '@/lib/seo/countryCurrency'
import { isPreviewCountryMode } from '@/lib/preview/countryMode'
import { getCountriesCached } from '@/lib/server/getCountriesCached'
import { resolveCountryIdFromHeaders } from '@/lib/server/resolveCountryIdFromHeaders'
import { timeSince } from '@/utils/date'
import mascot from '@/assets/uiux/mascot_sitting.png'
import styles from './marketPulse.module.css'

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value || '').trim()
}

function formatCount(value: number | null, locale: SupportedLocale, error: boolean): string {
  if (error || value == null) return locale === 'ar' ? 'غير متاح' : 'Unavailable'
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-US', { maximumFractionDigits: 0 }).format(value)
}

function formatPrice(price: unknown, currency: string | null, locale: SupportedLocale): string | null {
  if (price == null || price === '') return null
  const n = typeof price === 'number' ? price : Number(String(price).replace(/,/g, ''))
  if (!Number.isFinite(n) || n <= 0) return null
  const formatted = new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-US', { maximumFractionDigits: 0 }).format(n)
  if (currency === 'JOD') return locale === 'ar' ? `${formatted} د.أ` : `${formatted} JOD`
  if (currency) return `${formatted} ${currency}`
  return formatted
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const uiLocale: SupportedLocale = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE
  const title = uiLocale === 'ar' ? 'نبض السوق | ANANAS' : 'Market Pulse | ANANAS'
  const description =
    uiLocale === 'ar'
      ? 'أرقام السوق المتاحة من الخادم: الإعلانات المنشورة، المزادات المباشرة، وحركة الأقسام.'
      : 'Market figures the server actually returns: published listings, live auctions, and section movement.'
  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: `/${uiLocale}/market-pulse` },
  }
}

export default async function MarketPulsePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<SearchParams>
}) {
  const { locale: localeRaw } = await params
  const locale: SupportedLocale = isSupportedLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE
  const ar = locale === 'ar'
  const sp = (await searchParams) ?? {}
  const metric = first(sp.metric) || 'listings'
  const sectionSlug = first(sp.section)
  const cityRaw = Number(first(sp.city))
  const cityId = Number.isFinite(cityRaw) && cityRaw > 0 ? cityRaw : undefined
  const range = first(sp.range) || 'server'
  const rangeIgnored = range !== 'server' && range !== ''

  const headersList = await headers()
  const countryCode = headersList.get('x-country')?.trim().toLowerCase() || ''
  const countryId = await resolveCountryIdFromHeaders()
  const countries = await getCountriesCached()
  const country = countries.find((item) => item.id === countryId) || null

  const [sections, cities, source] = await Promise.all([
    fetchSections(locale, { revalidateSeconds: 300 }).catch(() => []),
    countryId ? fetchCitiesByCountryId(countryId).catch(() => []) : Promise.resolve([]),
    loadMarketPulseSource({
      countryId,
      land: locale,
      cityId,
      sectionSlug: sectionSlug || undefined,
    }),
  ])

  const model = buildMarketPulse(
    {
      ...source,
      listingsTotal: source.listingsTotal,
    },
    locale,
  )
  const activeMetric = model.metrics.find((item) => item.id === metric) || model.metrics[0]
  const maxBar = Math.max(1, ...model.bars.map((bar) => Math.max(bar.current, bar.previous)))

  let listings: Array<Record<string, unknown>> = []
  let listingsFailed = false
  let auctions: Array<Record<string, unknown>> = []
  let auctionsFailed = false

  if (metric === 'auctions') {
    try {
      const json = await fetchAuctions({
        land: locale,
        countryId,
        cityId,
        status: 'live',
        perPage: 8,
      })
      auctions = Array.isArray(json?.data) ? json.data : []
    } catch {
      auctionsFailed = true
    }
  } else {
    try {
      const json = await fetchPosts({
        countryId,
        land: locale,
        cityId,
        sectionSlug: sectionSlug || undefined,
        sort: 'newest',
        page: 1,
      })
      listings = (Array.isArray(json?.data) ? json.data : []).slice(0, 6)
    } catch {
      listingsFailed = true
    }
  }

  const headline =
    metric === 'auctions'
      ? formatCount(source.auctionsTotal, locale, source.auctionsError)
      : metric === 'sections'
        ? formatCount(source.sections.length, locale, source.sectionsError)
        : metric === 'measured'
          ? activeMetric?.value || '—'
          : formatCount(source.listingsTotal, locale, source.listingsError)

  return (
    <FeedLayoutClient locale={locale} sidebar={<SideBar sections={sections} locale={locale} />}>
      <Col md={8} lg={6} className={styles.page}>
        <header className={styles.header}>
          <Link href={`/${locale}`} className={styles.back}>
            {ar ? 'الرئيسية' : 'Home'}
          </Link>
          <h1>{ar ? 'نبض السوق' : 'Market Pulse'}</h1>
          <p>
            {ar
              ? 'ملخص الأرقام التي يعيدها الخادم. سلك السوق يبقى للأحداث الفردية.'
              : 'A summary of figures the server returns. The market wire stays the place for individual events.'}
          </p>
        </header>

        <form className={styles.filters} method="get" action={`/${locale}/market-pulse`}>
          <input type="hidden" name="metric" value={activeMetric?.id || 'listings'} />
          {isPreviewCountryMode() ? (
            <label>
              <span>{ar ? 'البلد' : 'Country'}</span>
              <select name="ananas_country" defaultValue={countryCode}>
                {countries.map((item) => {
                  const iso = (item.iso2 || item.iso_code || '').toLowerCase()
                  if (!iso) return null
                  return (
                    <option key={item.id} value={iso}>
                      {item.name}
                    </option>
                  )
                })}
              </select>
            </label>
          ) : (
            <p className={styles.countryLock}>
              {ar ? 'البلد الحالي:' : 'Current country:'} {country?.name || countryCode || '—'}
            </p>
          )}
          <label>
            <span>{ar ? 'المدينة' : 'City'}</span>
            <select name="city" defaultValue={cityId ? String(cityId) : ''}>
              <option value="">{ar ? 'كل المدن' : 'All cities'}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{ar ? 'القسم' : 'Category'}</span>
            <select name="section" defaultValue={sectionSlug}>
              <option value="">{ar ? 'كل الأقسام' : 'All sections'}</option>
              {sections.map((section) => (
                <option key={section.id} value={section.slug}>
                  {section.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{ar ? 'المدة' : 'Time range'}</span>
            <select name="range" defaultValue={rangeIgnored ? range : 'server'}>
              <option value="server">{ar ? 'كما يعيدها الخادم' : 'As the server returns it'}</option>
              <option value="24h" disabled>
                {ar ? '٢٤ ساعة — غير متاحة' : '24 hours — unavailable'}
              </option>
              <option value="7d" disabled>
                {ar ? '٧ أيام — غير متاحة' : '7 days — unavailable'}
              </option>
              <option value="30d" disabled>
                {ar ? '٣٠ يوماً — غير متاحة' : '30 days — unavailable'}
              </option>
            </select>
          </label>
          <button type="submit">{ar ? 'تحديث' : 'Update'}</button>
        </form>

        {rangeIgnored ? (
          <p className={styles.note} role="status">
            {ar
              ? 'الخادم لا يقبل مدى زمنياً. الأرقام لم تُصفَّ حسب المدة المطلوبة.'
              : 'The server does not accept a time range. Figures were not filtered by the requested period.'}
          </p>
        ) : null}

        {(cityId || sectionSlug) && (
          <p className={styles.note}>
            {ar
              ? 'عدد الإعلانات يتبع المدينة والقسم. المزادات المباشرة تتبع المدينة فقط. حركة الأقسام تبقى على مستوى البلد لأن تلك الواجهة لا تقبل مدينة أو قسماً.'
              : 'The listing count follows city and section. Live auctions follow the city only. Section movement stays country-level because that endpoint accepts neither a city nor a section.'}
          </p>
        )}

        <article className={styles.heroMetric}>
          <h2>{activeMetric?.label}</h2>
          <strong>{headline}</strong>
          <p>{activeMetric?.period}</p>
          <p className={styles.hint}>{activeMetric?.hint}</p>
        </article>

        <div className={styles.metricRow} role="tablist" aria-label={ar ? 'المؤشرات' : 'Metrics'}>
          {model.metrics.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={item.id === activeMetric?.id ? styles.metricOn : styles.metricOff}
              aria-current={item.id === activeMetric?.id ? 'page' : undefined}
              title={item.hint}
            >
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </Link>
          ))}
        </div>

        <section className={styles.chart} aria-label={ar ? 'مقارنة الأقسام' : 'Section comparison'}>
          <h2>{ar ? 'حركة الأقسام' : 'Section movement'}</h2>
          <p className={styles.hint}>
            {ar
              ? 'العمود هو current_count. النسبة تظهر فقط إذا كان previous_count أكبر من صفر.'
              : 'The bar is current_count. A percent is shown only when previous_count is greater than zero.'}
          </p>
          {model.bars.length === 0 ? (
            <p>{source.sectionsError ? (ar ? 'تعذر تحميل حركة الأقسام.' : 'Section movement could not be loaded.') : ar ? 'لا توجد حركة أقسام.' : 'No section movement.'}</p>
          ) : (
            <ul className={styles.chartList}>
              {model.bars.map((bar) => (
                <li key={bar.sectionId}>
                  <div className={styles.chartHead}>
                    <Link href={bar.href}>{bar.name}</Link>
                    <span>
                      {bar.current}
                      {bar.previous > 0 ? ` / ${bar.previous}` : ''}
                      {bar.growthLabel ? ` ${bar.growthLabel}` : ar ? ' · بلا نافذة سابقة' : ' · no previous window'}
                    </span>
                  </div>
                  <div className={styles.chartTrack} role="presentation">
                    <span style={{ width: `${Math.max(4, Math.round((bar.current / maxBar) * 100))}%` }} />
                    {bar.previous > 0 ? (
                      <i style={{ width: `${Math.max(2, Math.round((bar.previous / maxBar) * 100))}%` }} />
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {model.insight ? (
          <aside className={styles.insight}>
            <Image src={mascot} alt="" width={72} height={72} className={styles.mascot} />
            <p>{model.insight}</p>
          </aside>
        ) : null}

        <section className={styles.results} aria-label={ar ? 'نتائج مرتبطة' : 'Related results'}>
          <h2>
            {metric === 'auctions'
              ? ar
                ? 'مزادات مباشرة'
                : 'Live auctions'
              : ar
                ? 'إعلانات ضمن هذا النطاق'
                : 'Listings in this scope'}
          </h2>
          {metric === 'auctions' ? (
            auctionsFailed ? (
              <p role="alert">{ar ? 'تعذر تحميل المزادات.' : 'Auctions could not be loaded.'}</p>
            ) : auctions.length === 0 ? (
              <p>{ar ? 'لا توجد مزادات مباشرة في هذا البلد.' : 'There are no live auctions in this country.'}</p>
            ) : (
              <ul>
                {auctions.map((item, index) => {
                  const post = (item.post as Record<string, unknown> | undefined) || item
                  const id = String(item.id ?? post.id ?? index)
                  const title = String(post.title || item.title || id)
                  return (
                    <li key={id}>
                      <Link href={`/${locale}/pages/auction/${id}`}>{title}</Link>
                    </li>
                  )
                })}
              </ul>
            )
          ) : listingsFailed ? (
            <p role="alert">{ar ? 'تعذر تحميل الإعلانات.' : 'Listings could not be loaded.'}</p>
          ) : listings.length === 0 ? (
            <p>{ar ? 'لا توجد إعلانات ضمن هذا النطاق.' : 'No listings in this scope.'}</p>
          ) : (
            <ul>
              {listings.map((post) => {
                const id = String(post.id)
                const when = post.publish_date || post.created_at
                const price = formatPrice(
                  post.price,
                  resolveListingCurrency({
                    iso2: String((post.country as { iso2?: string } | undefined)?.iso2 || ''),
                    countryId: post.country_id ?? (post.country as { id?: number } | undefined)?.id,
                    countries,
                  }),
                  locale,
                )
                return (
                  <li key={id}>
                    <Link href={`/${locale}/post/${id}`}>{String(post.title || id)}</Link>
                    <span>
                      {String((post.city as { name?: string } | undefined)?.name || '')}
                      {price ? ` · ${price}` : ''}
                      {when ? ` · ${timeSince(String(when), locale)}` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <section className={styles.unavailable} aria-label={ar ? 'غير متاح' : 'Unavailable'}>
          <h2>{ar ? 'غير مقاس بعد' : 'Not measured yet'}</h2>
          <ul>
            {model.unavailable.map((item) => (
              <li key={item.id}>
                <strong>{item.label}</strong>
                <span>{item.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      </Col>
    </FeedLayoutClient>
  )
}
