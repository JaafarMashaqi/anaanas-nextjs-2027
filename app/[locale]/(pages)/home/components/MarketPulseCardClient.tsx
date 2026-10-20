'use client'

import Link from 'next/link'
import type { SectionMomentumItem } from '@/lib/api/homeInsights'
import type { SupportedLocale } from '@/lib/localization'
import { t } from '@/lib/translations'
import styles from './MarketPulseCardClient.module.css'

function pulseValue(item: SectionMomentumItem, locale: SupportedLocale) {
  if (!item.previous_count || item.previous_count <= 0) {
    return locale === 'ar' ? 'نشاط جديد' : 'New activity'
  }
  const rounded = Math.round(item.growth_percent)
  if (!Number.isFinite(rounded)) return locale === 'ar' ? 'غير محسوب' : 'Not measured'
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

const RANK_BADGES = ['🚗', '🏠', '📱', '💼', '📦', '⭐']

export default function MarketPulseCardClient({
  items,
  locale,
  variant = 'card',
}: {
  items: SectionMomentumItem[]
  locale: SupportedLocale
  variant?: 'card' | 'rail'
}) {
  if (variant === 'rail') {
    return (
      <div className={styles.rail}>
        <div className={styles.railHead}>
          <span className={styles.liveDot} aria-hidden />
          <h2>{t('home.marketPulse', locale)}</h2>
        </div>
        {items.length === 0 ? (
          <p className={styles.railEmpty}>{t('home.marketPulseEmpty', locale)}</p>
        ) : (
          <div className={styles.railTrack}>
            {items.map((item) => {
              const src = item.icon_full_path || null
              return (
                <Link key={item.section_id} href={`/${locale}/sections/${item.slug}`} className={styles.railChip}>
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" width={22} height={22} />
                  ) : null}
                  <span>{item.name}</span>
                  <strong>{pulseValue(item, locale)}</strong>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.glowOrbs} aria-hidden>
        <span className={`${styles.orb} ${styles.orb1}`} />
        <span className={`${styles.orb} ${styles.orb2}`} />
        <span className={`${styles.orb} ${styles.orb3}`} />
      </div>

      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className={styles.liveDot} aria-hidden />
          {t('home.marketPulse', locale)}
        </h2>
        <div className={styles.pulseStrip} aria-hidden>
          <span className={styles.pulseBar} />
          <span className={styles.pulseBar} />
          <span className={styles.pulseBar} />
          <span className={styles.pulseBar} />
        </div>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>{t('home.marketPulseEmpty', locale)}</p>
      ) : (
        <div className={styles.rows}>
          {items.map((item, index) => {
            const barPct = Math.min(100, Math.max(0, item.growth_percent))
            const src =item.icon_full_path || null ;
            return (
              <div key={item.section_id} className={styles.row}>
                <div className={styles.left}>
                  <div className={styles.iconWrap}>
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt=""
                        width={24}
                        height={24}
                        className={styles.iconImg}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span aria-hidden>{RANK_BADGES[index % RANK_BADGES.length]}</span>
                    )}
                  </div>
                  <div className={styles.textBlock}>
                    <Link href={`/${locale}/sections/${item.slug}`} className={styles.name}>
                      {item.name}
                    </Link>
                    <div className={styles.meta}>
                      {item.current_count} · {t('home.marketPulseGrowth', locale)}
                    </div>
                    <div className={styles.barTrack} role="presentation">
                      <div className={styles.barFill} style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                </div>
                <div className={styles.growth}>{pulseValue(item, locale)}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
