'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { BsBagCheck, BsBarChart, BsBullseye, BsGrid, BsGraphUpArrow, BsHammer, BsLightning, BsSearch, BsStars } from 'react-icons/bs'

import type { MarketPulseModel, PulseActivity, PulseMetric, PulseMetricId } from '@/lib/market/buildMarketPulse'
import type { SupportedLocale } from '@/lib/localization'
import { t } from '@/lib/translations'
import styles from './MarketPulseCardClient.module.css'

const ICONS = {
  listings: BsGrid,
  fresh: BsStars,
  activity: BsLightning,
  wanted: BsSearch,
  auctions: BsHammer,
  sections: BsBarChart,
  measured: BsGraphUpArrow,
  opportunities: BsBullseye,
  sold: BsBagCheck,
} as const

export type PulseLatestItem = {
  id: number
  title: string
  location: string
  isNew: boolean
  href: string
  priceLabel: string | null
}

function formatStamp(iso: string, locale: SupportedLocale) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

function LiveFigure({
  raw,
  fallback,
  storageKey,
  locale,
}: {
  raw: number | null
  fallback: string
  storageKey: string
  locale: SupportedLocale
}) {
  const [shown, setShown] = useState(fallback)

  useEffect(() => {
    if (raw == null) {
      setShown(fallback)
      return
    }
    const format = (value: number) =>
      new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-US', { maximumFractionDigits: 0 }).format(value)
    const key = `ananas.pulse.${storageKey}`
    const previous = Number(window.sessionStorage.getItem(key))
    window.sessionStorage.setItem(key, String(raw))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!Number.isFinite(previous) || previous === raw || reduce) {
      setShown(format(raw))
      return
    }
    const from = previous
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 420)
      setShown(format(Math.round(from + (raw - from) * progress)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [raw, fallback, storageKey, locale])

  return <strong className={styles.metricValue}>{shown}</strong>
}

function MetricCard({
  metric,
  locale,
  pressed,
  compact = false,
  onOpen,
}: {
  metric: PulseMetric
  locale: SupportedLocale
  pressed: boolean
  compact?: boolean
  onOpen: (id: PulseMetricId) => void
}) {
  const Icon = ICONS[metric.id]
  const ar = locale === 'ar'
  const levelLabel =
    metric.level === 'live' ? (ar ? 'مباشر' : 'Live') : metric.level === 'demo' ? (ar ? 'تجريبي' : 'Demo') : ar ? 'مخطط' : 'Planned'
  const figure =
    metric.level === 'live' ? (
      <LiveFigure raw={metric.raw} fallback={metric.value} storageKey={metric.id} locale={locale} />
    ) : (
      <strong className={styles.metricWord}>{metric.value}</strong>
    )
  if (compact) {
    return (
      <button
        type="button"
        className={`${styles.metric} ${styles.compact} ${styles[metric.tone]}`}
        title={`${metric.period}. ${metric.hint}`}
        aria-pressed={pressed}
        aria-label={`${levelLabel}. ${metric.label}. ${metric.value}. ${metric.period}. ${metric.hint}`}
        onClick={() => onOpen(metric.id)}
      >
        <span className={styles.metricIcon} aria-hidden>
          <Icon size={14} />
        </span>
        <span className={styles.compactBody}>
          <span className={styles.compactTop}>
            {figure}
            <span className={metric.level === 'live' ? styles.levelLive : metric.level === 'demo' ? styles.levelDemo : styles.levelBlocked}>
              {levelLabel}
            </span>
          </span>
          <span className={styles.metricLabel}>{metric.label}</span>
        </span>
      </button>
    )
  }
  return (
    <button
      type="button"
      className={`${styles.metric} ${styles[metric.tone]}`}
      title={metric.hint}
      aria-pressed={pressed}
      aria-label={`${levelLabel}. ${metric.label}. ${metric.value}. ${metric.period}. ${metric.hint}`}
      onClick={() => onOpen(metric.id)}
    >
      <span className={styles.metricTop}>
        <span className={styles.metricIcon} aria-hidden>
          <Icon size={15} />
        </span>
        <span className={metric.level === 'live' ? styles.levelLive : metric.level === 'demo' ? styles.levelDemo : styles.levelBlocked}>
          {levelLabel}
        </span>
      </span>
      <span className={styles.metricLabel}>{metric.label}</span>
      {figure}
      <span className={styles.metricPeriod}>{metric.period}</span>
    </button>
  )
}

function PulseStudio({
  metric,
  locale,
  latestItems,
  bars,
}: {
  metric: PulseMetric
  locale: SupportedLocale
  latestItems: PulseLatestItem[]
  bars: MarketPulseModel['bars']
}) {
  const ar = locale === 'ar'
  const periods = ['24h', '7d', '30d'] as const
  const [period, setPeriod] = useState<(typeof periods)[number]>('24h')
  const [notice, setNotice] = useState<string | null>(null)
  const flagged = latestItems.filter((item) => item.isNew).slice(0, 3)

  return (
    <div className={styles.studio}>
      <p className={styles.studioBanner}>
        {metric.level === 'demo'
          ? ar
            ? 'تجريبي — هذه لوحة واجهة. لا أرقام سوق هنا.'
            : 'Demo — this is an interface panel. There are no market numbers here.'
          : ar
            ? 'مخطط — لا نعرض عدداً قبل وجود سجل مؤكد.'
            : 'Planned — no count is shown until a confirmed record exists.'}
      </p>
      <p>{metric.hint}</p>
      {metric.level === 'demo' ? (
        <div className={styles.periods} role="group" aria-label={ar ? 'نافذة الواجهة' : 'Interface window'}>
          {periods.map((item) => (
            <button
              key={item}
              type="button"
              className={period === item ? styles.periodOn : styles.period}
              onClick={() => {
                setPeriod(item)
                setNotice(
                  ar
                    ? 'الخادم لا يصفّي النبض بهذه النافذة. الاختيار لا يغيّر الأرقام المباشرة.'
                    : 'The server does not filter pulse by this window. The choice does not change live numbers.',
                )
              }}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      {notice ? <p className={styles.studioNote}>{notice}</p> : null}
      {metric.id === 'fresh' && flagged.length > 0 ? (
        <ul className={styles.latest}>
          {flagged.map((item) => (
            <li key={item.id}>
              <Link href={item.href}>{item.title}</Link>
              <span>{ar ? 'شارة is_new في آخر قائمة، ليست الإجمالي' : 'is_new on the latest list, not the total'}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {metric.level === 'demo' ? (
        <div className={styles.sketch} aria-hidden>
          <span style={{ width: '72%' }} />
          <span style={{ width: '48%' }} />
          <span style={{ width: '34%' }} />
        </div>
      ) : null}
      {bars.length > 0 ? (
        <p className={styles.studioNote}>
          {ar ? 'أقسام حقيقية يمكن فتحها:' : 'Real sections you can open:'}{' '}
          {bars.slice(0, 3).map((bar, index) => (
            <Link key={bar.sectionId} href={bar.href}>
              {bar.name}
              {index < Math.min(2, bars.length - 1) ? ' · ' : ''}
            </Link>
          ))}
        </p>
      ) : null}
      <div className={styles.studioActions}>
        <Link href={metric.href}>{ar ? 'افتح مساراً حقيقياً' : 'Open a real route'}</Link>
        <button
          type="button"
          onClick={() =>
            setNotice(
              ar
                ? 'التنبيه يبقى في هذه الجلسة فقط. الخادم لا يحفظ اشتراكاً.'
                : 'The alert stays in this session only. The server does not save a subscription.',
            )
          }
        >
          {ar ? 'نبهني هنا' : 'Alert me here'}
        </button>
      </div>
    </div>
  )
}

function PulseDrawer({
  model,
  locale,
  generatedAt,
  latestItems,
  activities,
  focus,
  drawerId,
}: {
  model: MarketPulseModel
  locale: SupportedLocale
  generatedAt: string
  latestItems: PulseLatestItem[]
  activities: PulseActivity[]
  focus: PulseMetricId | null
  drawerId: string
}) {
  const ar = locale === 'ar'
  const focused = focus ? model.metrics.find((item) => item.id === focus) : null
  const showRanks = (!focus || focus === 'sections' || focus === 'measured') && (!focused || focused.level === 'live')
  const showLatest = (!focus || focus === 'listings') && (!focused || focused.level === 'live')
  const showLiveBody = !focused || focused.level === 'live'
  return (
    <div className={styles.drawer} id={drawerId}>
      <p className={styles.source}>
        {ar ? 'كما في' : 'As of'} {formatStamp(generatedAt, locale)}
        {' · '}
        {ar ? 'المصدر:' : 'Source:'} /api/posts, /api/auctions, /api/home/section-momentum, /api/home/latest-listings
      </p>
      {focused && focused.level !== 'live' ? (
        <PulseStudio metric={focused} locale={locale} latestItems={latestItems} bars={model.bars} />
      ) : null}
      {focused && focused.level === 'live' ? (
        <div className={styles.focus}>
          <h3>{focused.label}</h3>
          <p>{focused.hint}</p>
          <p>{focused.period}</p>
          <Link href={focused.href}>{ar ? 'افتح هذا المؤشر' : 'Open this metric'}</Link>
        </div>
      ) : null}
      {showLiveBody ? <h3>{ar ? 'ما الذي تغيّر فعلاً' : 'What actually changed'}</h3> : null}
      {showLiveBody && activities.length === 0 ? (
        <p className={styles.railEmpty}>{ar ? 'لا توجد أحداث في هذه الاستجابة.' : 'This response has no activity events.'}</p>
      ) : null}
      {showLiveBody && activities.length > 0 ? (
        <ul className={styles.activity}>
          {activities.map((item) => (
            <li key={item.id} data-kind={item.kind}>
              <Link href={item.href}>{item.text}</Link>
            </li>
          ))}
        </ul>
      ) : null}
      {showRanks ? (
        <ol className={styles.rank}>
          {model.bars.map((bar, index) => (
            <li key={bar.sectionId}>
              <Link href={bar.href}>
                <span>{index + 1}</span>
                <strong>{bar.name}</strong>
                <em>
                  {bar.current}
                  {bar.growthLabel ? ` ${bar.growthLabel}` : ar ? ' · بلا نافذة سابقة' : ' · no earlier window'}
                </em>
              </Link>
            </li>
          ))}
        </ol>
      ) : null}
      {showLatest ? (
        <>
          <h3>{ar ? 'أحدث ما أعاده الخادم' : 'Latest returned by the server'}</h3>
          {latestItems.length === 0 ? (
            <p className={styles.railEmpty}>{ar ? 'لا توجد إعلانات في آخر استجابة.' : 'The latest-listings response was empty.'}</p>
          ) : (
            <ul className={styles.latest}>
              {latestItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.href}>{item.title}</Link>
                  <span>
                    {item.location}
                    {item.priceLabel ? ` · ${item.priceLabel}` : ''}
                    {item.isNew ? (ar ? ' · جديد' : ' · new') : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.railEmpty}>
            {ar
              ? 'شارة «جديد» تأتي من الحقل is_new. عددها ليس إجمالي الإعلانات الجديدة.'
              : 'The new badge is the is_new field. It is not a total of new listings.'}
          </p>
        </>
      ) : null}
      {!focus ? (
        <ul className={styles.missing}>
          {model.unavailable.map((item) => (
            <li key={item.id}>
              <strong>{item.label}.</strong> {item.reason}
            </li>
          ))}
        </ul>
      ) : null}
      <Link href={focused?.href || `/${locale}/market-pulse`} className={styles.fullLink}>
        {ar ? 'صفحة النبض الكاملة' : 'Full pulse page'}
      </Link>
    </div>
  )
}

export default function MarketPulseCardClient({
  model,
  locale,
  variant = 'card',
  generatedAt,
  latestItems,
  activities,
}: {
  model: MarketPulseModel
  locale: SupportedLocale
  variant?: 'card' | 'rail'
  generatedAt: string
  latestItems: PulseLatestItem[]
  activities: PulseActivity[]
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [focus, setFocus] = useState<PulseMetricId | null>(null)
  const drawerId = variant === 'rail' ? 'market-pulse-drawer-rail' : 'market-pulse-drawer-stack'
  const isArabic = locale === 'ar'
  const detailsLabel = open ? (isArabic ? 'إخفاء' : 'Hide') : isArabic ? 'التفاصيل' : 'Details'

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const node = scroller.current
    if (!node) return
    event.preventDefault()
    const card = node.querySelector<HTMLElement>(`.${styles.metric}`)
    const width = (card?.offsetWidth ?? 180) + 10
    const forward = event.key === 'ArrowRight'
    const delta = isArabic ? (forward ? -width : width) : forward ? width : -width
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    node.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' })
  }

  const openMetric = (id: PulseMetricId) => {
    setFocus(id)
    setOpen(true)
  }

  const head = (
    <div className={styles.railHead}>
      <h2>{t('home.marketPulse', locale)}</h2>
      <button
        type="button"
        className={styles.railMore}
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => {
          setFocus(null)
          setOpen((value) => !value)
        }}
      >
        {detailsLabel}
      </button>
    </div>
  )

  return (
    <section className={variant === 'rail' ? styles.rail : styles.stack} aria-label={t('home.marketPulse', locale)}>
      {head}
      <p className={styles.stamp}>
        {isArabic ? 'كما في' : 'As of'} {formatStamp(generatedAt, locale)}
      </p>
      {variant === 'rail' ? (
        <div
          ref={scroller}
          className={styles.railTrack}
          tabIndex={0}
          role="list"
          aria-label={isArabic ? 'مؤشرات النبض' : 'Pulse metrics'}
          onKeyDown={onKeyDown}
        >
          {model.metrics.map((metric) => (
            <div key={metric.id} className={styles.railItem} role="listitem">
              <MetricCard compact metric={metric} locale={locale} pressed={open && focus === metric.id} onOpen={openMetric} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className={styles.stackList}>
            {model.metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} locale={locale} pressed={open && focus === metric.id} onOpen={openMetric} />
            ))}
          </div>
          {model.bars.length === 0 ? (
            <p className={styles.railEmpty}>{t('home.marketPulseEmpty', locale)}</p>
          ) : (
            <ol className={styles.rank}>
              {model.bars.map((bar, index) => (
                <li key={bar.sectionId}>
                  <Link href={bar.href} title={bar.growthLabel ?? (isArabic ? 'لا توجد نافذة سابقة' : 'No previous window')}>
                    <span>{index + 1}</span>
                    <strong>{bar.name}</strong>
                    <em>
                      {bar.current}
                      {bar.growthLabel ? ` ${bar.growthLabel}` : ''}
                    </em>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
      {open ? (
        <PulseDrawer
          model={model}
          locale={locale}
          generatedAt={generatedAt}
          latestItems={latestItems}
          activities={activities}
          focus={focus}
          drawerId={drawerId}
        />
      ) : null}
    </section>
  )
}
