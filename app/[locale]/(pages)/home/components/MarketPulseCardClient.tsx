'use client'

import { useRef, type KeyboardEvent } from 'react'
import Link from 'next/link'
import { BsBarChart, BsHammer, BsGrid, BsGraphUpArrow } from 'react-icons/bs'

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

function MetricCard({ metric, locale }: { metric: PulseMetric; locale: SupportedLocale }) {
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

export default function MarketPulseCardClient({
  model,
  locale,
  variant = 'card',
}: {
  model: MarketPulseModel
  locale: SupportedLocale
  variant?: 'card' | 'rail'
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const isArabic = locale === 'ar'

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

  if (variant === 'rail') {
    return (
      <section className={styles.rail} aria-label={t('home.marketPulse', locale)}>
        <div className={styles.railHead}>
          <h2>{t('home.marketPulse', locale)}</h2>
          <Link href={`/${locale}/market-pulse`} className={styles.railMore}>
            {isArabic ? 'التفاصيل' : 'Details'}
          </Link>
        </div>
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
              <MetricCard metric={metric} locale={locale} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  const max = Math.max(1, ...model.bars.map((bar) => Math.max(bar.current, bar.previous)))

  return (
    <section className={styles.stack} aria-label={t('home.marketPulse', locale)}>
      <div className={styles.railHead}>
        <h2>{t('home.marketPulse', locale)}</h2>
        <Link href={`/${locale}/market-pulse`} className={styles.railMore}>
          {isArabic ? 'التفاصيل' : 'Details'}
        </Link>
      </div>
      <div className={styles.stackList}>
        {model.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} locale={locale} />
        ))}
      </div>
      {model.bars.length === 0 ? (
        <p className={styles.railEmpty}>{t('home.marketPulseEmpty', locale)}</p>
      ) : (
        <ul className={styles.bars}>
          {model.bars.map((bar) => (
            <li key={bar.sectionId}>
              <Link href={bar.href} className={styles.barLink} title={bar.growthLabel ?? (isArabic ? 'لا توجد نافذة سابقة' : 'No previous window')}>
                <span className={styles.barName}>{bar.name}</span>
                <span className={styles.barTrack} aria-hidden>
                  <span className={styles.barFill} style={{ width: `${Math.round((bar.current / max) * 100)}%` }} />
                </span>
                <span className={styles.barValue}>
                  {bar.current}
                  {bar.growthLabel ? <em>{bar.growthLabel}</em> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
