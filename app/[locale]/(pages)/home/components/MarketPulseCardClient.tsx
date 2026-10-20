'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { BsBarChart, BsGrid, BsGraphUpArrow, BsHammer } from 'react-icons/bs'

import type { MarketPulseModel, PulseMetric } from '@/lib/market/buildMarketPulse'
import type { SupportedLocale } from '@/lib/localization'
import { t } from '@/lib/translations'
import styles from './MarketPulseCardClient.module.css'

const ICONS = {
  listings: BsGrid,
  auctions: BsHammer,
  sections: BsBarChart,
  measured: BsGraphUpArrow,
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

function MetricCard({ metric }: { metric: PulseMetric }) {
  const Icon = ICONS[metric.id]
  return (
    <Link
      href={metric.href}
      className={`${styles.metric} ${styles[metric.tone]}`}
      title={metric.hint}
      aria-label={`${metric.label}. ${metric.value}. ${metric.period}. ${metric.hint}`}
    >
      <span className={styles.metricIcon} aria-hidden>
        <Icon size={15} />
      </span>
      <span className={styles.metricLabel}>{metric.label}</span>
      <strong className={styles.metricValue}>{metric.value}</strong>
      <span className={styles.metricPeriod}>{metric.period}</span>
    </Link>
  )
}

function PulseDrawer({
  model,
  locale,
  generatedAt,
  latestItems,
  drawerId,
}: {
  model: MarketPulseModel
  locale: SupportedLocale
  generatedAt: string
  latestItems: PulseLatestItem[]
  drawerId: string
}) {
  const ar = locale === 'ar'
  return (
    <div className={styles.drawer} id={drawerId}>
      <p className={styles.source}>
        {ar ? 'كما في' : 'As of'} {formatStamp(generatedAt, locale)}
        {' · '}
        {ar ? 'المصدر:' : 'Source:'} /api/posts, /api/auctions, /api/home/section-momentum, /api/home/latest-listings
      </p>
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
      <ul className={styles.missing}>
        {model.unavailable.map((item) => (
          <li key={item.id}>
            <strong>{item.label}.</strong> {item.reason}
          </li>
        ))}
      </ul>
      <Link href={`/${locale}/market-pulse`} className={styles.fullLink}>
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
}: {
  model: MarketPulseModel
  locale: SupportedLocale
  variant?: 'card' | 'rail'
  generatedAt: string
  latestItems: PulseLatestItem[]
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
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

  const head = (
    <div className={styles.railHead}>
      <h2>{t('home.marketPulse', locale)}</h2>
      <button
        type="button"
        className={styles.railMore}
        aria-expanded={open}
        aria-controls={drawerId}
        onClick={() => setOpen((value) => !value)}
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
              <MetricCard metric={metric} />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className={styles.stackList}>
            {model.metrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
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
          drawerId={drawerId}
        />
      ) : null}
    </section>
  )
}
